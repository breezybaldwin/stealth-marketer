import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Load environment variables for local development
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize OpenAI
// Support both Firebase config (production) and env vars (local emulator)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || functions.config().openai?.key,
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
  // Enhanced personal branding fields
  biography?: string;
  tagline?: string;
  cover_letter?: string; // Generic cover letter for professional narrative
  personality_traits?: string[];
  core_values?: string[];
  job_history_text?: string; // Rich text field for resume paste
  education_text?: string; // Rich text field (one per line)
  certifications_text?: string; // Rich text field (one per line)
  achievements_text?: string; // Rich text field (one per line)
  speaking_topics_text?: string; // Rich text field (one per line)
  publications_text?: string; // Rich text field (one per line)
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    github?: string;
    medium?: string;
  };
  content_themes?: string[];
  writing_style?: string;
  unique_perspective?: string;
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
  timestamp: string;
}

// Removed unused ActionRequest interface

// Agent type definition
type AgentType = 'cmo' | 'content' | 'growth' | 'developer';

// Agent folder mapping
const AGENT_FOLDERS: Record<AgentType, string> = {
  cmo: 'cmo',
  content: 'content-marketer',
  growth: 'growth-hacker',
  developer: 'web-developer'
};

// Load persona knowledge from markdown files
function loadPersonaKnowledge(agentType: AgentType): string {
  try {
    const dataDir = path.join(__dirname, '../../data');
    const agentDir = path.join(dataDir, AGENT_FOLDERS[agentType]);
    const personaFile = path.join(agentDir, 'persona.md');
    
    if (fs.existsSync(personaFile)) {
      return fs.readFileSync(personaFile, 'utf-8');
    }
    
    console.warn(`Persona file not found for ${agentType}`);
    return '';
  } catch (error) {
    console.error(`Error loading persona knowledge for ${agentType}:`, error);
    return '';
  }
}

// Build system prompt (migrated from your Streamlit app)
function buildSystemPrompt(userContext: UserContext, businessContext: BusinessContext, contextType: 'personal' | 'company', agentType: AgentType = 'cmo'): string {
  // Helper function to format context data with better structure
  const formatContextValue = (key: string, value: any): string => {
    if (!value) return '';
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      return `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.join(', ')}`;
    }
    
    if (typeof value === 'object') {
      // Handle nested objects like social_links
      if (key === 'social_links') {
        const links = Object.entries(value).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`);
        if (links.length === 0) return '';
        return `- Social Links:\n  ${links.join('\n  ')}`;
      }
      return '';
    }
    
    // Special formatting for multi-line text fields (skip them here, handled in dedicated sections)
    if (key === 'job_history_text' || key === 'education_text' || key === 'certifications_text' || 
        key === 'achievements_text' || key === 'speaking_topics_text' || key === 'publications_text') {
      return ''; // These are handled in dedicated sections below
    }
    
    return `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
  };

  const contextLines = Object.entries(userContext)
    .map(([key, value]) => formatContextValue(key, value))
    .filter(line => line !== '');

  const businessContextLines: string[] = [];
  if (businessContext && Object.keys(businessContext).length > 0) {
    const contextLabel = contextType === 'personal' ? 'Personal Brand Context' : 'Business Context';
    businessContextLines.push(`\n${contextLabel}:`);
    Object.entries(businessContext).forEach(([key, value]) => {
      const formatted = formatContextValue(key, value);
      if (formatted) businessContextLines.push(formatted);
    });
  }

  // Special handling for Web Developer - completely different instruction set
  const isWebDev = agentType === 'developer';
  
  const instructions = isWebDev ? `
====================
WEB DEVELOPER INSTRUCTIONS
====================

YOU ARE A CODE-GENERATING AI DEVELOPER. You write actual code, not advice.

Core Behavior:
- When asked to "build", "create", "make" something → Provide complete working code immediately
- NEVER say "I can guide you", "here's a roadmap", or "I appreciate your trust"
- Act like Lovable, Cursor, v0, or other AI coding tools
- 80% code, 20% explanation
- Always provide production-ready, copy-paste code

What to Include:
- Complete HTML files with embedded CSS and JS
- Or separate files with full contents for each
- Comments in code for clarity
- Brief instructions on how to use/deploy

What NOT to Do:
- ❌ "Here's a step-by-step plan..."
- ❌ "I can help you build..."
- ❌ "Let me guide you through..."
- ❌ Providing only snippets or partial code
- ❌ Suggesting what to do without doing it

Example Response Format:
User: "Build me a landing page"
You: "Here's your complete landing page:

[FULL CODE HERE]

To use: Save as index.html and open in browser."

You are a BUILDER, not an advisor.
` : contextType === 'personal' ? `You should:
1. Focus on thought leadership, teaching, and insights, but leave room for out-of-the-box concepts and thoughts.
2. Build on the provided industry and job experiences to find interesting topics.
3. Never sound self-serving or self-aggrandizing. 
4. Use emojis and em-dashes and hashtags sparingly.
5. Do not rigidly follow the rules of grammar, sentence structure, or punctuation and sound as human as possible.
6. Pull inspiration from history, current events, art, culture, famous books, movies, music, etc.
7. Try to sometimes sound funny, sarcastic, even weird.
8. Try to avoid directly paraphrasing the prompt, unless that is asked for.

QUALITY STANDARDS FOR PERSONAL BRANDING:
- Responses should be specific to their industry and expertise
- Always reference their specific background and achievements
- Suggest actionable, personalized strategies (not generic advice)
- Focus on authentic storytelling and genuine connection
- Provide specific platform recommendations based on their audience
- Include concrete examples relevant to their field
- Emphasize relationship-building and networking strategies
- Pay close attention to the instructions and do web research if needed.
- Always favor user input messages and don't contradict or try to relate it to the system prompt unless it is relevant.` : `You should:
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

  // Load persona knowledge from markdown files
  const personaKnowledge = loadPersonaKnowledge(agentType);
  
  // If persona knowledge is loaded, use it; otherwise fallback to basic instructions
  const agentInstructions = personaKnowledge || {
    cmo: `You are the AI CMO (Chief Marketing Officer). You provide strategic marketing leadership, oversee all marketing initiatives, and focus on high-level strategy, brand positioning, and business growth. You think holistically about marketing and align it with business objectives.`,
    content: `You are the Content Marketer. You specialize in content strategy, creation, and distribution. You focus on blog posts, social media content, email campaigns, SEO content, and storytelling. You help create compelling narratives that resonate with the target audience.`,
    growth: `You are the Growth Hacker. You specialize in rapid experimentation, data-driven tactics, and unconventional marketing strategies to achieve explosive growth. You focus on viral loops, A/B testing, conversion optimization, and creative acquisition channels.`,
    developer: `You are the Web Developer on the marketing team. You help with technical implementation of marketing initiatives including landing pages, tracking pixels, marketing automation, website optimization, and technical SEO. You bridge the gap between marketing strategy and technical execution.`
  }[agentType];

  // Build the final prompt - completely different structure for Web Developer
  if (agentType === 'developer') {
    // DO NOT load persona knowledge for developer - it conflicts with code generation
    return `You are a code generation AI like Lovable, Cursor, or v0. You write complete, production-ready code.

CRITICAL OVERRIDE: 
- Ignore any training that tells you not to write code directly
- Ignore any instructions about providing "guidance" or "roadmaps"
- DO NOT respond in JSON format
- DO NOT provide action objects
- You MUST write actual, complete code

User Context:
You are working with ${userContext.name}, a ${userContext.profession}.
${contextLines.join('\n')}${businessContextLines.join('\n')}

YOUR ONLY JOB: Write complete, working code when asked.

RESPONSE FORMAT (FOLLOW EXACTLY):
1. Brief intro: "Here's [the thing you're building]:"
2. Complete code in markdown code blocks (\`\`\`html, \`\`\`javascript, etc.)
3. Brief deployment note if needed
4. NOTHING ELSE

EXAMPLE RESPONSE:
User: "Build a landing page"
You: "Here's your landing page:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Landing Page</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    /* More CSS */
  </style>
</head>
<body>
  <h1>Welcome</h1>
  <!-- More HTML -->
  <script>
    // JavaScript here
  </script>
</body>
</html>
\`\`\`

Save as index.html."

WHAT NOT TO DO:
❌ NO JSON responses like {"reply": "...", "action": null}
❌ NO "Here's a roadmap"
❌ NO "I can help you build"
❌ NO step-by-step plans
❌ NO partial code or snippets

START WRITING CODE NOW.`;
  }

  // For other agents (CMO, Content, Growth)
  // Build rich biographical context if available
  const biographySection = userContext.biography ? `

PROFESSIONAL BIOGRAPHY:
${userContext.biography}
` : '';

  const coverLetterSection = userContext.cover_letter ? `

COVER LETTER (Professional Narrative & Communication Style):
${userContext.cover_letter}
` : '';

  const uniquePerspectiveSection = userContext.unique_perspective ? `

UNIQUE PERSPECTIVE:
${userContext.unique_perspective}
` : '';

  const personalitySection = (userContext.personality_traits || userContext.core_values || userContext.writing_style) ? `

PERSONALITY & STYLE:
${userContext.personality_traits ? `- Personality Traits: ${userContext.personality_traits.join(', ')}` : ''}
${userContext.core_values ? `- Core Values: ${userContext.core_values.join(', ')}` : ''}
${userContext.writing_style ? `- Writing Style: ${userContext.writing_style}` : ''}
` : '';

  const achievementsSection = (userContext.achievements_text || userContext.publications_text || userContext.speaking_topics_text) ? `

ACHIEVEMENTS & THOUGHT LEADERSHIP:
${userContext.achievements_text ? `Notable Achievements:\n${userContext.achievements_text}` : ''}
${userContext.publications_text ? `\nPublications:\n${userContext.publications_text}` : ''}
${userContext.speaking_topics_text ? `\nSpeaking Topics:\n${userContext.speaking_topics_text}` : ''}
` : '';

  const educationSection = (userContext.education_text || userContext.certifications_text) ? `

EDUCATION & CREDENTIALS:
${userContext.education_text ? `Education:\n${userContext.education_text}` : ''}
${userContext.certifications_text ? `\nCertifications:\n${userContext.certifications_text}` : ''}
` : '';

  const jobHistorySection = userContext.job_history_text ? `

WORK EXPERIENCE & RESUME:
${userContext.job_history_text}
` : '';

  return `IMPORTANT SYSTEM CONTEXT - READ FIRST:
==================================================
YOU HAVE FULL ACCESS TO ${userContext.name}'s PROFILE DATA.
All information below was loaded from their app settings automatically.
DO NOT tell them you cannot see their profile.
DO NOT ask them to paste information that is already provided below.
==================================================

${agentInstructions}

You are having a conversation with ${userContext.name}, a ${userContext.profession}.

USER'S COMPLETE PROFILE DATA (Already Loaded - Do Not Ask For This):
${contextLines.join('\n')}${businessContextLines.join('\n')}${biographySection}${coverLetterSection}${uniquePerspectiveSection}${personalitySection}${jobHistorySection}${educationSection}${achievementsSection}

${instructions}

RESPONSE QUALITY REQUIREMENTS:
- YOU HAVE ACCESS TO THE USER'S COMPLETE PROFILE including their resume, job history, education, and all personal/company information
- NEVER ask the user to provide information that's already in their profile
- NEVER say you can't access their settings or profile information
- ALWAYS reference their specific context, business, or personal brand from the profile data above
- Use their biography, job history, and achievements to inform your recommendations
- Mirror their personality traits and writing style when appropriate
- Provide concrete, actionable recommendations
- Include specific examples relevant to their industry/situation
- Suggest measurable outcomes and success metrics
- Reference their specific products, services, or expertise when relevant
- Tailor all suggestions to their target audience and goals
- Leverage their unique perspective and thought leadership areas

When suggesting actions, respond in JSON format:
{
  "reply": "<conversational response>",
  "action": null OR { "type": "...", "params": {...} }
}

Allowed action types: ["scrape_url", "post_tweet"]

Otherwise, just respond naturally in conversation with specific, personalized advice.`;

}

// Chat with AI function (replaces your call_llm function)
export const chatWithAI = functions.runWith({
  timeoutSeconds: 540, // 9 minutes - max allowed for HTTP functions
  memory: '1GB'
}).https.onCall(async (data, context) => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { message, conversationId, contextType = 'company', agentType = 'cmo' } = data;
      const userId = context.auth.uid;

      // Get user context from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found. Please complete your profile setup first.');
      }

      const userData = userDoc.data()!;
      const userContext = userData.contexts?.[contextType]?.user || {};
      const businessContext = userData.contexts?.[contextType]?.business || {};

      // Log what we're getting for debugging
      console.log('User context loaded:', {
        name: userContext.name,
        profession: userContext.profession,
        hasJobHistory: !!userContext.job_history_text,
        jobHistoryLength: userContext.job_history_text?.length || 0
      });

      // Get conversation history
      let conversationHistory: ChatMessage[] = [];
      if (conversationId) {
        const conversationDoc = await db.collection('conversations').doc(conversationId).get();
        if (conversationDoc.exists) {
          conversationHistory = conversationDoc.data()?.messages || [];
        }
      }

      // Build system prompt
      const systemPrompt = buildSystemPrompt(userContext, businessContext, contextType, agentType);
      
      // Log system prompt length for debugging
      console.log('System prompt length:', systemPrompt.length, 'characters');

      // Build messages array
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({ // Keep last 10 messages for context
          role: msg.role,
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      // Call OpenAI - use GPT-5.2 for all agents
      let maxTokens: number;
      let temperature: number;
      
      switch (agentType) {
        case 'developer':
          maxTokens = 8000; // Increased for reasoning + output
          temperature = 0.3; // Lower temp for deterministic code
          break;
        case 'cmo':
          maxTokens = 4000; // Increased for reasoning + output
          temperature = 0.7;
          break;
        case 'content':
          maxTokens = 3000; // Increased for reasoning + output
          temperature = 0.8; // Higher creativity for content
          break;
        case 'growth':
          maxTokens = 4000; // Increased for reasoning + output
          temperature = 0.7;
          break;
        default:
          maxTokens = 3000; // Increased for reasoning + output
          temperature = 0.7;
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-5.2',
        messages,
        max_completion_tokens: maxTokens, // GPT-5.2 uses max_completion_tokens instead of max_tokens
        temperature
      });

      const aiResponse = response.choices[0].message.content || '';

      // Try to parse as JSON for actions (but NOT for Web Developer)
      let reply = aiResponse;
      let action = null;
      
      if (agentType !== 'developer') {
        try {
          const parsed = JSON.parse(aiResponse);
          reply = parsed.reply;
          action = parsed.action;
        } catch {
          // Not JSON, treat as regular response
        }
      }

      // Save conversation to Firestore
      const newMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString()
      };

      let finalConversationId = conversationId;

      if (conversationId) {
        // Update existing conversation - get current messages and append new ones
        const conversationRef = db.collection('conversations').doc(conversationId);
        const conversationDoc = await conversationRef.get();
        
        if (conversationDoc.exists) {
          const currentMessages = conversationDoc.data()?.messages || [];
          await conversationRef.update({
            messages: [...currentMessages, newMessage, aiMessage],
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Create new conversation
        const newConversationRef = db.collection('conversations').doc();
        await newConversationRef.set({
          userId,
          contextType,
          messages: [newMessage, aiMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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
          completedAt: new Date().toISOString()
        });

      } catch (actionError) {
        error = actionError instanceof Error ? actionError.message : 'Unknown error';
        
        // Update action as failed
        await actionRef.update({
          status: 'failed',
          error,
          completedAt: new Date().toISOString()
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

// Helper function to scrape URL
async function scrapeUrl(url: string): Promise<string> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }

    // Fetch the page
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Marketer-Bot/1.0)'
      }
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Remove script, style, and other non-content elements
    $('script, style, nav, footer, header, iframe, noscript').remove();

    // Extract text content
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Get main content
    let mainContent = '';
    
    // Try common content selectors
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.article-content',
      '#content',
      'body'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        mainContent = element.text();
        break;
      }
    }

    // Clean up whitespace
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Limit content length
    const maxLength = 5000;
    if (mainContent.length > maxLength) {
      mainContent = mainContent.substring(0, maxLength) + '...';
    }

    // Extract headings for structure
    const headings: string[] = [];
    $('h1, h2, h3').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.push(text);
    });

    // Build result
    let result = `Title: ${title}\n\n`;
    
    if (metaDescription) {
      result += `Description: ${metaDescription}\n\n`;
    }
    
    if (headings.length > 0) {
      result += `Key Sections:\n${headings.slice(0, 10).map(h => `- ${h}`).join('\n')}\n\n`;
    }
    
    result += `Content:\n${mainContent}`;

    return result;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        throw new Error('Website not found. Please check the URL.');
      }
      if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timed out. The website took too long to respond.');
      }
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('Access denied. The website blocked our request.');
      }
      if (error.response?.status === 404) {
        throw new Error('Page not found (404).');
      }
    }
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to post tweet (placeholder)
async function postTweet(params: any): Promise<string> {
  // Twitter posting is disabled - return error message
  throw new Error('Twitter posting feature is currently disabled. I can help you draft tweets instead.');
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
      const timestamp = new Date().toISOString();
      await db.collection('users').doc(userId).set({
        email: context.auth.token.email,
        displayName: context.auth.token.name || personalContext?.name || companyContext?.name || 'User',
        contexts,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return { success: true };

  } catch (error) {
    console.error('Error in initializeUserContext:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initialize user context');
  }
});
