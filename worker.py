import sys, json
from playwright.sync_api import sync_playwright
import requests
from bs4 import BeautifulSoup

def scrape_url_simple(url):
    """Simple requests-based fallback scraper"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Get title
        title_tag = soup.find('title')
        title = title_tag.text.strip() if title_tag else 'No title found'
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Try to find main content
        content_selectors = ['main', 'article', '.content', '#content', '.post-content']
        content = ""
        
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                content = ' '.join([elem.get_text() for elem in elements])
                break
        
        # If no main content, get body text
        if not content:
            body = soup.find('body')
            if body:
                content = body.get_text()
        
        # Clean up content
        lines = content.split('\n')
        clean_lines = []
        for line in lines:
            line = line.strip()
            if line and len(line) > 10:
                clean_lines.append(line)
        
        content = '\n\n'.join(clean_lines[:30])  # Take first 30 meaningful lines
        
        if len(content) > 3000:
            content = content[:3000] + "... [truncated]"
        
        return {
            "status": "ok",
            "title": title,
            "content": content,
            "url": url,
            "method": "requests"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "title": "",
            "content": f"Simple scraping failed for {url}: {str(e)}",
            "url": url,
            "method": "requests"
        }

def scrape_url(params):
    url = params["url"]
    
    # First try the advanced Playwright method
    with sync_playwright() as p:
        # Launch browser with stealth settings
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor',
                '--disable-web-security',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection'
            ]
        )
        
        # Create context with realistic user agent and settings
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            java_script_enabled=True,
            extra_http_headers={
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        )
        
        page = context.new_page()
        
        # Add stealth scripts
        page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
            
            window.chrome = {
                runtime: {},
            };
        """)
        
        try:
            # Go to page with longer timeout and wait for network idle
            page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Wait a bit more for any dynamic content
            page.wait_for_timeout(3000)
            
            # Get basic page info
            title = page.title()
            
            # Check for bot detection patterns
            page_content = page.content()
            if any(phrase in page_content.lower() for phrase in [
                'just a moment', 'verifying you are human', 'cloudflare', 
                'checking your browser', 'please wait', 'security check'
            ]):
                # Try waiting longer for the real content
                try:
                    page.wait_for_timeout(10000)  # Wait 10 more seconds
                    title = page.title()
                    page_content = page.content()
                except:
                    pass
            
            # Extract main content (try multiple selectors)
            content_selectors = [
                'main', 'article', '.content', '#content', 
                '.post-content', '.entry-content', '.article-content',
                '.main-content', '[role="main"]', '.container p',
                'h1, h2, h3, p'
            ]
            
            content = ""
            for selector in content_selectors:
                try:
                    elements = page.query_selector_all(selector)
                    if elements:
                        for element in elements[:15]:  # Increased limit
                            text = element.inner_text()
                            if text and len(text.strip()) > 30:  # Lower threshold
                                # Skip common bot detection text
                                if not any(phrase in text.lower() for phrase in [
                                    'just a moment', 'verifying you are human', 
                                    'please wait', 'checking your browser'
                                ]):
                                    content += text.strip() + "\n\n"
                        if len(content) > 500:  # Got enough content
                            break
                except:
                    continue
            
            # If still no good content, try body but filter out bot detection
            if len(content) < 100:
                try:
                    body_text = page.query_selector('body').inner_text()
                    # Filter out bot detection messages
                    lines = body_text.split('\n')
                    filtered_lines = []
                    for line in lines:
                        if not any(phrase in line.lower() for phrase in [
                            'just a moment', 'verifying you are human', 
                            'cloudflare', 'checking your browser', 'please wait'
                        ]) and len(line.strip()) > 20:
                            filtered_lines.append(line.strip())
                    
                    content = '\n\n'.join(filtered_lines[:20])  # Take first 20 good lines
                except:
                    content = "Could not extract content"
            
            # If still no content, it might be heavily protected
            if len(content) < 50:
                content = f"Website appears to be protected by bot detection. Title: {title}"
            
            # Limit content length
            if len(content) > 5000:
                content = content[:5000] + "... [truncated]"
            
            browser.close()
            return {
                "status": "ok", 
                "title": title, 
                "content": content,
                "url": url
            }
        except Exception as e:
            browser.close()
            # If Playwright fails, try the simple requests method
            print(f"Playwright failed, trying simple method: {str(e)}", file=sys.stderr)
            return scrape_url_simple(url)

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
