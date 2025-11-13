import os
from openai import OpenAI
import streamlit as st
import json
import subprocess
from dotenv import load_dotenv
from datetime import datetime
import re
from urllib.parse import urlparse

# Load environment variables from .env file
load_dotenv()

# Get API key and initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    st.error("❌ OPENAI_API_KEY environment variable not found. Please set it in your .env file or environment.")
    st.stop()

client = OpenAI(api_key=api_key)

# Import different RAG contexts
def load_context(context_type):
    """Load the appropriate context based on the selected type"""
    if context_type == "company":
        try:
            from company_context import USER_CONTEXT, BUSINESS_CONTEXT
            return USER_CONTEXT, BUSINESS_CONTEXT
        except ImportError:
            return get_default_company_context()
    elif context_type == "personal":
        try:
            from personal_context import USER_CONTEXT, PERSONAL_BRAND_CONTEXT
            return USER_CONTEXT, PERSONAL_BRAND_CONTEXT
        except ImportError:
            return get_default_personal_context()
    else:
        return get_default_company_context()

def get_default_company_context():
    """Default company marketing context"""
    USER_CONTEXT = {
        "name": "User",
        "profession": "Marketing professional",
        "voice": "Professional, helpful, and strategic",
        "goals": "Effective marketing campaigns and strategies",
        "preferences": "Data-driven decisions, creative solutions"
    }
    BUSINESS_CONTEXT = {}
    return USER_CONTEXT, BUSINESS_CONTEXT

def get_default_personal_context():
    """Default personal branding context"""
    USER_CONTEXT = {
        "name": "User",
        "profession": "Marketing professional",
        "voice": "Authentic and strategic",
        "goals": "Build personal brand and thought leadership",
        "preferences": "Authentic storytelling, strategic networking"
    }
    PERSONAL_BRAND_CONTEXT = {}
    return USER_CONTEXT, PERSONAL_BRAND_CONTEXT

# Enhanced system prompt with RAG context
def build_system_prompt(user_context, business_context, context_type):
    context_lines = []
    for key, value in user_context.items():
        context_lines.append(f"- {key.title()}: {value}")
    
    business_context_lines = []
    if business_context:
        context_label = "Personal Brand Context" if context_type == "personal" else "Business Context"
        business_context_lines.append(f"\n{context_label}:")
        for key, value in business_context.items():
            if isinstance(value, list):
                business_context_lines.append(f"- {key.title()}: {', '.join(value)}")
            else:
                business_context_lines.append(f"- {key.title()}: {value}")
    
    # Different instructions based on context type
    if context_type == "personal":
        instructions = """You should:
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
- Suggest content themes that align with their expertise"""
    else:
        instructions = """You should:
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
- Emphasize competitive advantages and unique value propositions"""
    
    return f"""You are an expert marketing assistant having a conversation with {user_context['name']}, a {user_context['profession']}.

User Context:
{chr(10).join(context_lines)}{chr(10).join(business_context_lines)}

{instructions}

RESPONSE QUALITY REQUIREMENTS:
- NEVER give generic, one-size-fits-all advice
- ALWAYS reference their specific context, business, or personal brand
- Provide concrete, actionable recommendations
- Include specific examples relevant to their industry/situation
- Suggest measurable outcomes and success metrics
- Reference their specific products, services, or expertise when relevant
- Tailor all suggestions to their target audience and goals

When suggesting actions, respond in JSON format:
{{
  "reply": "<conversational response>",
  "action": null OR {{ "type": "...", "params": {{...}} }}
}}

Allowed action types: ["scrape_url", "post_tweet"]

Otherwise, just respond naturally in conversation with specific, personalized advice.
"""

def call_llm(user_input, conversation_history, context_type="company"):
    try:
        # Load the appropriate context
        user_context, business_context = load_context(context_type)
        
        # Build system prompt with current context
        system_prompt = build_system_prompt(user_context, business_context, context_type)
        
        # Build messages with conversation history
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in conversation_history:
            messages.append(msg)
        
        # Add current user input
        messages.append({"role": "user", "content": user_input})
        
        # DEBUG: Show what's being sent to ChatGPT
        if st.session_state.get("debug_mode", False):
            with st.expander("🔍 DEBUG: Full API Request", expanded=False):
                st.write("**System Prompt:**")
                st.code(system_prompt)
                st.write("**Conversation History:**")
                st.json(conversation_history)
                st.write("**Original User Input:**")
                st.write(user_input.split('\n\n--- SCRAPED CONTENT')[0] if '--- SCRAPED CONTENT' in user_input else user_input)
                if '--- SCRAPED CONTENT' in user_input:
                    st.write("**🌐 Enhanced with Scraped Content:** ✅")
                    st.write("**Full Enhanced Input:**")
                    st.code(user_input)
                st.write("**Full Messages Array:**")
                st.json(messages)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )
        return response.choices[0].message.content, None
    except Exception as e:
        return None, str(e)

def execute_action(action_data):
    try:
        result = subprocess.run(
            ["python", "worker.py", json.dumps(action_data)],
            capture_output=True, text=True
        )
        return result.stdout, result.stderr
    except Exception as e:
        return None, str(e)

def extract_urls(text):
    """Extract URLs from text using regex"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, text)
    return urls

def scrape_url_content(url):
    """Scrape content from a URL using the worker with fallback methods"""
    try:
        action_data = {
            "type": "scrape_url",
            "params": {"url": url}
        }
        result = subprocess.run(
            ["python3", "worker.py", json.dumps(action_data)],
            capture_output=True, text=True,
            timeout=45  # Increased timeout for bot detection bypass
        )
        if result.returncode == 0:
            # Parse the result - worker returns Python dict format
            scraped_data = eval(result.stdout.strip())
            title = scraped_data.get('title', '')
            content = scraped_data.get('content', '')
            
            # Check if we got bot detection content
            if any(phrase in content.lower() for phrase in [
                'just a moment', 'verifying you are human', 'cloudflare'
            ]):
                return title, f"⚠️ Bot detection encountered. The website {url} is using protection that prevents automated access. Try accessing the site manually and copying relevant content.", None
            
            return title, content, None
        else:
            return None, None, result.stderr
    except subprocess.TimeoutExpired:
        return None, None, "Scraping timed out - the website may be heavily protected"
    except Exception as e:
        return None, None, str(e)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "conversation_history" not in st.session_state:
    st.session_state.conversation_history = []
if "current_context" not in st.session_state:
    st.session_state.current_context = "company"

# Load current context for display
current_user_context, current_business_context = load_context(st.session_state.current_context)

st.title("🤖 AI Marketing Assistant")
st.caption(f"Having a conversation with {current_user_context['name']} - {current_user_context['profession']}")

# RAG Context Switcher
col1, col2 = st.columns([3, 1])
with col1:
    context_type = st.selectbox(
        "🎯 Marketing Focus:",
        ["company", "personal"],
        index=0 if st.session_state.current_context == "company" else 1,
        format_func=lambda x: "🏢 Company Marketing" if x == "company" else "👤 Personal Branding",
        key="context_selector"
    )

with col2:
    if st.button("🔄 Switch Context"):
        st.session_state.current_context = context_type
        st.session_state.messages = []  # Clear conversation when switching
        st.session_state.conversation_history = []
        st.rerun()

# Update current context if changed
if context_type != st.session_state.current_context:
    st.session_state.current_context = context_type
    st.session_state.messages = []
    st.session_state.conversation_history = []
    st.rerun()

# Display conversation history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        
        # Show action results if available
        if message["role"] == "assistant" and "action_result" in message:
            with st.expander("Action Result"):
                st.code(message["action_result"])

# Chat input
if prompt := st.chat_input("Type your message..."):
    # Add user message to chat
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Check for URLs in the prompt and scrape them automatically
    urls = extract_urls(prompt)
    scraped_content = ""
    
    if urls:
        with st.chat_message("assistant"):
            with st.spinner(f"🔍 Found {len(urls)} URL(s) in your message. Scraping content..."):
                for url in urls:
                    st.info(f"Scraping: {url}")
                    title, content, error = scrape_url_content(url)
                    if error:
                        st.warning(f"Could not scrape {url}: {error}")
                    else:
                        st.success(f"✅ Scraped: {title}")
                        scraped_content += f"\n\n--- SCRAPED CONTENT FROM {url} ---\n"
                        scraped_content += f"Title: {title}\n\n{content}\n"
                        scraped_content += "--- END SCRAPED CONTENT ---\n\n"
    
    # Enhance prompt with scraped content
    enhanced_prompt = prompt
    if scraped_content:
        enhanced_prompt = f"""{prompt}

{scraped_content}

Please analyze the above scraped content along with my request and provide a comprehensive response based on both my question and the website content."""
    
    # Get AI response
    with st.chat_message("assistant"):
        with st.spinner("Analyzing content and generating response..."):
            response, error = call_llm(enhanced_prompt, st.session_state.conversation_history, st.session_state.current_context)
        
        if error:
            st.error(f"❌ Error: {error}")
            if "quota" in error.lower() or "rate limit" in error.lower():
                st.warning("💡 This appears to be a rate limit or quota issue. Please check your OpenAI account billing.")
        else:
            # Try to parse as JSON for actions
            try:
                data = json.loads(response)
                reply = data["reply"]
                action = data.get("action")
                
                # Display the reply
                st.markdown(reply)
                
                # Add to conversation history (use original prompt, not enhanced)
                st.session_state.conversation_history.append({"role": "user", "content": prompt})
                st.session_state.conversation_history.append({"role": "assistant", "content": reply})
                
                # Handle action if present
                if action:
                    st.info(f"🔧 Proposed action: {action['type']}")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button("✅ Execute", key=f"execute_{len(st.session_state.messages)}"):
                            with st.spinner("Executing action..."):
                                result, error = execute_action(action)
                                if error:
                                    st.error(f"Action failed: {error}")
                                else:
                                    st.success("Action completed!")
                                    st.code(result)
                                    
                                    # Add action result to the message
                                    st.session_state.messages[-1]["action_result"] = result
                    
                    with col2:
                        if st.button("❌ Skip", key=f"skip_{len(st.session_state.messages)}"):
                            st.info("Action skipped")
                
                # Add assistant message to chat
                st.session_state.messages.append({
                    "role": "assistant", 
                    "content": reply,
                    "action": action
                })
                
            except json.JSONDecodeError:
                # Not JSON, treat as regular conversation
                st.markdown(response)
                
                # Add to conversation history (use original prompt, not enhanced)
                st.session_state.conversation_history.append({"role": "user", "content": prompt})
                st.session_state.conversation_history.append({"role": "assistant", "content": response})
                
                # Add assistant message to chat
                st.session_state.messages.append({"role": "assistant", "content": response})

# Sidebar with conversation controls
with st.sidebar:
    st.header("Conversation Controls")
    
    if st.button("🗑️ Clear Conversation"):
        st.session_state.messages = []
        st.session_state.conversation_history = []
        st.rerun()
    
    # Debug mode toggle
    st.session_state.debug_mode = st.checkbox("🔍 Debug Mode", value=st.session_state.get("debug_mode", False))
    
    # Show current context
    context_label = "🏢 Company Marketing" if st.session_state.current_context == "company" else "👤 Personal Branding"
    st.header(f"Current Focus: {context_label}")
    
    st.header("User Context")
    st.json(current_user_context)
    
    if current_business_context:
        context_title = "Business Context" if st.session_state.current_context == "company" else "Personal Brand Context"
        st.header(context_title)
        st.json(current_business_context)
    
    st.header("Conversation Stats")
    st.metric("Messages", len(st.session_state.messages))
    st.metric("History Length", len(st.session_state.conversation_history))
