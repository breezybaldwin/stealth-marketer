import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OpenAI } from 'openai';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});


// Types
interface UserContext {
  name: string;
  profession: string;
  company?: string;
  industry: string;
  voice: string;
  goals: string;
  preferences: string;
  expertise: string[];
  target_audience: string;
  brand_values: string;
}

interface BusinessContext {
  products?: string[];
  services?: string[];
  competitors?: string[];
  unique_value_prop?: string;
  recent_campaigns?: string[];
  challenges?: string[];
  business_model?: string;
  pricing_strategy?: string;
  sales_process?: string;
  key_metrics?: string[];
  success_stories?: string[];
  current_focus?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: admin.firestore.Timestamp;
}

// Removed unused ActionRequest interface

// Build system prompt (migrated from your Streamlit app)
function buildSystemPrompt(userContext: UserContext, businessContext: BusinessContext, contextType: 'personal' | 'company'): string {
  const contextLines = Object.entries(userContext).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.join(', ')}`;
    }
    return `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
  });

  const businessContextLines: string[] = [];
  if (businessContext && Object.keys(businessContext).length > 0) {
    const contextLabel = contextType === 'personal' ? 'Personal Brand Context' : 'Business Context';
    businessContextLines.push(`\n${contextLabel}:`);
    Object.entries(businessContext).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        businessContextLines.push(`- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.join(', ')}`);
      } else {
        businessContextLines.push(`- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
      }
    });
  }

  const instructions = contextType === 'personal' ? `You should:
1. Focus on thought leadership, teaching, and insights, but leave room for out-of-the-box concepts and thoughts.
2. Build on the provided industry and job experiences to find niche topics
3. Never sound self-serving or self-aggrandizing. 
4. Never use emojis, em-dashes, hashtags, or rigidly follow the rules of grammar, sentence structure, or punctuation.
5. Pull inspiration from history, current events, art, culture, famous books, movies, music, etc.
6. Use the weirdest and most interesting voice, data and inspiration you can.
7. Try to avoid directly using the data from the context, but use it to inspire your response.

QUALITY STANDARDS FOR PERSONAL BRANDING:
- Responses should be specific to their industry and expertise
- Always reference their specific background and achievements
- Suggest actionable, personalized strategies (not generic advice)
- Focus on authentic storytelling and genuine connection
- Provide specific platform recommendations based on their audience
- Include concrete examples relevant to their field
- Emphasize relationship-building and networking strategies
- Pay close attention to the instructions and do web research if needed.
- Always favor user input messages and don't contradict or try to relate it to the system prompt unless it is relevant.
- Suggest content themes that align with their expertise` : `You should:
1. Focus on company marketing strategies and campaigns
2. Help with business growth and customer acquisition
3. Suggest data-driven marketing approaches
4. Provide strategic business marketing advice

QUALITY STANDARDS FOR COMPANY MARKETING:
- Responses should be specific to their business and industry
- Always reference their specific products/services and target audience
- Suggest measurable, ROI-focused strategies (not generic advice)
- Provide specific campaign ideas tailored to their business
- Include concrete metrics and KPIs relevant to their goals
- Focus on customer acquisition and business growth
- Suggest data-driven approaches with specific tools/platforms
- Emphasize competitive advantages and unique value propositions`;

  return `You are an expert marketing assistant having a conversation with ${userContext.name}, a ${userContext.profession}.

User Context:
${contextLines.join('\n')}${businessContextLines.join('\n')}

${instructions}

RESPONSE QUALITY REQUIREMENTS:
- NEVER give generic, one-size-fits-all advice
- ALWAYS reference their specific context, business, or personal brand
- Provide concrete, actionable recommendations
- Include specific examples relevant to their industry/situation
- Suggest measurable outcomes and success metrics
- Reference their specific products, services, or expertise when relevant
- Tailor all suggestions to their target audience and goals

When suggesting actions, respond in JSON format:
{
  "reply": "<conversational response>",
  "action": null OR { "type": "...", "params": {...} }
}

Allowed action types: ["scrape_url", "post_tweet"]

Otherwise, just respond naturally in conversation with specific, personalized advice.`;
}

// Chat with AI function (replaces your call_llm function)
export const chatWithAI = functions.https.onCall(async (data, context) => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { message, conversationId, contextType = 'company' } = data;
      const userId = context.auth.uid;

      // Get user context from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found. Please complete your profile setup first.');
      }

      const userData = userDoc.data()!;
      const userContext = userData.contexts?.[contextType]?.user || {};
      const businessContext = userData.contexts?.[contextType]?.business || {};

      // Get conversation history
      let conversationHistory: ChatMessage[] = [];
      if (conversationId) {
        const conversationDoc = await db.collection('conversations').doc(conversationId).get();
        if (conversationDoc.exists) {
          conversationHistory = conversationDoc.data()?.messages || [];
        }
      }

      // Build system prompt
      const systemPrompt = buildSystemPrompt(userContext, businessContext, contextType);

      // Build messages array
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({ // Keep last 10 messages for context
          role: msg.role,
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message.content || '';

      // Try to parse as JSON for actions
      let reply = aiResponse;
      let action = null;
      try {
        const parsed = JSON.parse(aiResponse);
        reply = parsed.reply;
        action = parsed.action;
      } catch {
        // Not JSON, treat as regular response
      }

      // Save conversation to Firestore
      const newMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: admin.firestore.Timestamp.now()
      };

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: admin.firestore.Timestamp.now()
      };

      let finalConversationId = conversationId;

      if (conversationId) {
        // Update existing conversation
        await db.collection('conversations').doc(conversationId).update({
          messages: admin.firestore.FieldValue.arrayUnion(newMessage, aiMessage),
          updatedAt: admin.firestore.Timestamp.now()
        });
      } else {
        // Create new conversation
        const newConversationRef = db.collection('conversations').doc();
        await newConversationRef.set({
          userId,
          contextType,
          messages: [newMessage, aiMessage],
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
        finalConversationId = newConversationRef.id;
      }

      return {
        reply,
        action,
        conversationId: finalConversationId
      };

  } catch (error) {
    console.error('Error in chatWithAI:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process chat message');
  }
});

// Execute action function (replaces your worker.py)
export const executeAction = functions.https.onCall(async (data, context) => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { actionType, params } = data;
      const userId = context.auth.uid;

      // Create action record
      const actionRef = db.collection('actions').doc();
      await actionRef.set({
        userId,
        type: actionType,
        params,
        status: 'processing',
        createdAt: admin.firestore.Timestamp.now()
      });

      let result = '';
      let error = null;

      try {
        switch (actionType) {
          case 'scrape_url':
            result = await scrapeUrl(params.url);
            break;
          case 'post_tweet':
            result = await postTweet(params);
            break;
          default:
            throw new Error(`Unknown action type: ${actionType}`);
        }

        // Update action as completed
        await actionRef.update({
          status: 'completed',
          result,
          completedAt: admin.firestore.Timestamp.now()
        });

      } catch (actionError) {
        error = actionError instanceof Error ? actionError.message : 'Unknown error';
        
        // Update action as failed
        await actionRef.update({
          status: 'failed',
          error,
          completedAt: admin.firestore.Timestamp.now()
        });
      }

      return {
        success: !error,
        result,
        error,
        actionId: actionRef.id
      };

  } catch (error) {
    console.error('Error in executeAction:', error);
    throw new functions.https.HttpsError('internal', 'Failed to execute action');
  }
});

// Helper function to scrape URL (simplified version of your scraping logic)
async function scrapeUrl(url: string): Promise<string> {
  // For now, return a placeholder - you can implement full Playwright scraping later
  // This would require setting up Playwright in Cloud Functions environment
  return `Scraped content from ${url} - [Placeholder: Full Playwright implementation needed]`;
}

// Helper function to post tweet (placeholder)
async function postTweet(params: any): Promise<string> {
  // Placeholder for Twitter API integration
  return `Tweet posted: ${params.text} - [Placeholder: Twitter API integration needed]`;
}

// Initialize user context function
export const initializeUserContext = functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { personalContext, companyContext } = data;
      const userId = context.auth.uid;

      // Build contexts object based on what was provided
      const contexts: any = {};
      
      if (personalContext) {
        contexts.personal = {
          user: personalContext,
          business: {} // Personal branding doesn't need business context
        };
      }
      
      if (companyContext) {
        contexts.company = {
          user: {
            name: companyContext.name,
            profession: companyContext.profession,
            company: companyContext.company,
            industry: companyContext.industry,
            voice: companyContext.voice || 'Professional, helpful, and strategic',
            goals: companyContext.goals,
            preferences: companyContext.preferences || 'Data-driven decisions, creative solutions',
            expertise: companyContext.expertise || ['Digital marketing', 'Content strategy'],
            target_audience: companyContext.target_audience,
            brand_values: companyContext.brand_values || 'Innovation and strategic growth'
          },
          business: {
            products: companyContext.products || [],
            services: companyContext.services || ['Marketing', 'Consulting'],
            unique_value_prop: companyContext.unique_value_prop || 'Innovative solutions for modern businesses'
          }
        };
      }

      // Create user document with custom contexts
      await db.collection('users').doc(userId).set({
        email: context.auth.token.email,
        displayName: context.auth.token.name || personalContext?.name || companyContext?.name || 'User',
        contexts,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });

      return { success: true };

  } catch (error) {
    console.error('Error in initializeUserContext:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initialize user context');
  }
});
