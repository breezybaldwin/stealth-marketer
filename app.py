import os
from openai import OpenAI
import streamlit as st
import json
import subprocess

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are a marketing assistant.
Always respond in JSON:
{
  "reply": "<text reply for user>",
  "action": null OR { "type": "...", "params": {...} }
}
Allowed action types: ["scrape_url", "post_tweet"]
"""

def call_llm(user_input):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_input}
        ],
        max_tokens=500
    )
    return response.choices[0].message.content

st.title("🤖 AI Marketer")

user_input = st.text_input("Type your request:")

if st.button("Send") and user_input:
    raw = call_llm(user_input)
    try:
        data = json.loads(raw)
    except:
        st.error("Invalid JSON from model")
        st.write(raw)
        st.stop()

    st.write("**Assistant:**", data["reply"])

    if data["action"]:
        st.info(f"Proposed action: {data['action']}")
        confirm = st.button("✅ Approve action")
        if confirm:
            result = subprocess.run(
                ["python", "worker.py", json.dumps(data["action"])],
                capture_output=True, text=True
            )
            st.write("Worker result:", result.stdout)
