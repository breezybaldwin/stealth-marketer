# Google Analytics 4 & Event Tracking Implementation

## Overview

Implementing comprehensive event tracking using Google Analytics 4 (GA4) and Google Tag Manager (GTM) to measure user behavior, conversions, and marketing performance accurately.

## When to Use This

- New website or app launch
- Marketing campaign requires tracking
- Need to measure specific user actions
- Setting up conversion tracking
- Implementing enhanced ecommerce
- Migrating from Universal Analytics
- Debugging tracking issues

## Step-by-Step Process

### 1. Planning & Documentation

**Create Tracking Plan:**
- List all events to track
- Define event parameters
- Document conversion events
- Map user journey touchpoints
- Define custom dimensions needed
- Plan data layer structure

**Example Tracking Plan Template:**
```
Event Name: form_submission
Category: Forms
Trigger: Form submit
Parameters:
  - form_name: string
  - form_location: string
  - user_type: string
```

### 2. Google Analytics 4 Setup

**Create GA4 Property:**
1. Log into Google Analytics
2. Create new GA4 property
3. Set up data streams (Web, iOS, Android)
4. Note Measurement ID (G-XXXXXXXXXX)
5. Configure data retention settings
6. Enable Google Signals if desired

**Configure Basic Settings:**
- Set timezone and currency
- Enable enhanced measurement (automatic events)
- Configure data filters if needed
- Set up user permissions
- Link to Google Ads if applicable

### 3. Google Tag Manager Setup

**Create GTM Container:**
1. Create new GTM account/container
2. Choose Web container type
3. Note Container ID (GTM-XXXXXX)
4. Install GTM code in website <head> and <body>

**GTM Code Placement:**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 4. Data Layer Implementation

**Setup Data Layer:**
```javascript
// Initialize data layer before GTM
window.dataLayer = window.dataLayer || [];

// Push initial data
dataLayer.push({
  'userId': 'USER_ID', // if logged in
  'userType': 'customer', // or 'prospect', 'visitor'
  'pageType': 'homepage',
  // Add other page-level data
});
```

**Event Push Example:**
```javascript
// Button click event
document.querySelector('#cta-button').addEventListener('click', function() {
  dataLayer.push({
    'event': 'cta_click',
    'buttonText': this.textContent,
    'buttonLocation': 'hero'
  });
});

// Form submission
document.querySelector('#contact-form').addEventListener('submit', function(e) {
  dataLayer.push({
    'event': 'form_submission',
    'formName': 'contact_form',
    'formLocation': 'footer'
  });
});
```

### 5. GTM Configuration

**Setup GA4 Configuration Tag:**
1. Create new Tag → Google Analytics: GA4 Configuration
2. Enter Measurement ID
3. Set trigger to "All Pages"
4. Add common parameters if needed
5. Save and name clearly

**Create Event Tags:**
For each event:
1. Create new Tag → Google Analytics: GA4 Event
2. Choose Configuration Tag
3. Enter Event Name
4. Add Event Parameters
5. Set appropriate trigger
6. Test and save

**Example Event Tag:**
- Tag Name: "GA4 - Form Submission"
- Event Name: `form_submission`
- Event Parameters:
  - `form_name`: `{{DLV - Form Name}}`
  - `form_location`: `{{DLV - Form Location}}`
- Trigger: Custom Event = form_submission

### 6. Create GTM Variables

**Data Layer Variables:**
```
Variable Name: DLV - Form Name
Variable Type: Data Layer Variable
Data Layer Variable Name: formName
```

**Custom JavaScript Variables (if needed):**
```javascript
function() {
  // Example: Get button text
  return {{Click Element}}.textContent;
}
```

### 7. Setup Triggers

**Common Triggers:**

**Page View:**
- Trigger Type: Page View
- This trigger fires on: Some Page Views (add conditions)

**Click Trigger:**
- Trigger Type: All Elements / Just Links
- Firing conditions: Click ID / Class / Text

**Form Submission:**
- Trigger Type: Form Submission
- Wait for Tags / validation: As needed

**Custom Event:**
- Trigger Type: Custom Event
- Event name: (from data layer)

### 8. Conversion Tracking

**Mark Events as Conversions:**
1. In GA4, go to Events
2. Find your event
3. Toggle "Mark as conversion"

**Key Conversions to Track:**
- Form submissions
- Button clicks (primary CTAs)
- Purchases
- Sign ups
- Download completions
- Video engagement
- Scroll depth (if relevant)

### 9. Testing & Debugging

**GTM Preview Mode:**
1. Click "Preview" in GTM
2. Enter website URL
3. Navigate site and trigger events
4. Check Tag Assistant panel
5. Verify tags fire correctly
6. Check data layer values

**GA4 Debug View:**
1. Enable Debug mode in GTM config tag
2. Or install GA Debugger Chrome extension
3. Go to GA4 → Configure → DebugView
4. Perform actions on site
5. Verify events appear in real-time

**Common Checks:**
- All tags firing on correct triggers
- Data layer values populating correctly
- Events appearing in GA4 DebugView
- Parameters included with events
- No errors in browser console

### 10. Publishing & Documentation

**Publish GTM Container:**
1. Review all changes in workspace
2. Add version name and description
3. Click "Submit"
4. Publish version

**Document Implementation:**
- List all events tracked
- Document data layer structure
- Note GTM variable names
- Record conversion events
- Document any custom code
- Create testing checklist

## Best Practices

### Event Naming
- Use lowercase with underscores: `button_click`
- Be descriptive but concise
- Use consistent naming convention
- Follow GA4 recommended events when possible

### Data Layer
- Initialize before GTM snippet
- Use consistent key names
- Don't store PII (Personally Identifiable Information)
- Keep structure flat when possible
- Push events, don't overwrite whole object

### Testing
- Always use GTM Preview mode
- Test on multiple devices
- Check in GA4 DebugView
- Verify data accuracy
- Test edge cases
- Document test results

### Performance
- Load GTM asynchronously
- Minimize custom JavaScript
- Avoid synchronous XHR requests
- Use built-in variables when possible
- Limit number of tags firing on pageload

## Common Pitfalls to Avoid

- **No tracking plan**: Implementing without strategy
- **Hardcoding values**: Not using GTM variables
- **Testing in production**: Not using Preview mode
- **Complex data layer**: Overly nested structure
- **Missing error handling**: Code breaks tracking
- **Not documenting**: Team can't maintain
- **Tracking PII**: Privacy violations
- **Too many events**: Analysis paralysis

## Expected Outcomes

### Successful Implementation:
- All events tracked accurately
- Data appears in GA4 within 24-48 hours
- Conversions marked and tracked
- GTM container well-organized
- Documentation complete
- Team trained on debugging

### Data Quality Indicators:
- Events firing consistently
- Parameters populated correctly
- No errors in console
- Data matches expectations
- Reports showing accurate data

## GA4 Recommended Events

### Ecommerce:
- `view_item`
- `add_to_cart`
- `begin_checkout`
- `purchase`

### Lead Generation:
- `generate_lead`
- `sign_up`
- `form_start`
- `form_submit`

### Engagement:
- `click`
- `scroll`
- `file_download`
- `video_start`
- `video_complete`

## Related Tasks

- [Landing Page Development](./landing-pages.md)
- [A/B Test Implementation](./ab-test-setup.md)
- [Technical SEO](./technical-seo.md)

## Tools & Resources

- Google Tag Manager
- Google Analytics 4
- GA Debugger Chrome Extension
- Tag Assistant (Chrome Extension)
- GTM Preview Mode
- Browser Developer Console
- Charles Proxy (for mobile debugging)

## Debugging Checklist

- [ ] GTM container loads on page
- [ ] Data layer initialized before GTM
- [ ] All tags firing on correct triggers
- [ ] Event parameters populated
- [ ] Events appear in GA4 DebugView
- [ ] Conversions marked in GA4
- [ ] No JavaScript errors
- [ ] Works on mobile devices
- [ ] Works across browsers
- [ ] Documentation complete


