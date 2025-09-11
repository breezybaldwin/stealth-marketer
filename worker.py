import sys, json
from playwright.sync_api import sync_playwright

def scrape_url(params):
    url = params["url"]
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        title = page.title()
        browser.close()
    return {"status": "ok", "title": title}

def post_tweet(params):
    # ⚠️ Credentials should come from environment, not user prompt
    user = params["username"]
    pwd = params["password"]
    text = params["text"]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://twitter.com/login")
        page.fill('input[name="session[username_or_email]"]', user)
        page.fill('input[name="session[password]"]', pwd)
        page.click('div[data-testid="LoginForm_Login_Button"]')
        page.wait_for_timeout(3000)
        page.goto("https://twitter.com/compose/tweet")
        page.fill('div[aria-label="Tweet text"]', text)
        page.click('div[data-testid="tweetButtonInline"]')
        browser.close()
    return {"status": "posted"}

if __name__ == "__main__":
    action = json.loads(sys.argv[1])
    action_type = action["type"]
    params = action["params"]

    if action_type == "scrape_url":
        print(scrape_url(params))
    elif action_type == "post_tweet":
        print(post_tweet(params))
    else:
        print({"status": "error", "msg": "Unknown action"})
