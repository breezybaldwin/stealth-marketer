# A/B Testing

## Overview

Designing, implementing, and analyzing A/B tests to systematically improve conversion rates and optimize user experiences through data-driven experimentation.

## When to Use This

- Optimizing conversion funnels
- Testing new features or design changes
- Improving email performance
- Optimizing pricing or messaging
- Validating hypotheses about user behavior
- Reducing friction points
- When you have sufficient traffic for statistical significance

## Step-by-Step Process

### 1. Hypothesis Formation
- Identify problem or opportunity
- Review qualitative and quantitative data
- Form clear hypothesis: "If we change X to Y, we expect Z outcome because..."
- Define expected impact
- Document rationale

### 2. Prioritization
Use ICE framework:
- **Impact**: How much will this move the needle? (1-10)
- **Confidence**: How sure are we this will work? (1-10)
- **Ease**: How easy is this to implement? (1-10)
- Score = (Impact × Confidence) / Ease

### 3. Test Design
- Define primary metric (one clear winner)
- Define secondary metrics (guard rails)
- Determine sample size needed
- Calculate test duration
- Decide on:
  - Traffic split (usually 50/50)
  - Test scope (page, section, or element)
  - Audience targeting (if any)

### 4. Variant Creation
- Design control (current experience)
- Design treatment (new experience)
- Keep changes isolated to one variable if possible
- For multivariate tests, plan all combinations
- Review designs with team
- Get developer to implement

### 5. Pre-Launch Checklist
- QA both variants thoroughly
  - Desktop and mobile
  - Different browsers
  - Different devices
- Verify tracking is working correctly
- Check that traffic split is configured correctly
- Ensure no cookie/caching issues
- Test with small traffic first (5-10%)
- Document test setup

### 6. Launch & Monitor
- Launch to full traffic
- Monitor first few hours/days closely
- Check for:
  - Technical issues
  - Unexpected user behavior
  - Data collection issues
  - Significant bugs or errors
- Document any issues or interventions

### 7. Let Test Run
- Don't peek at results constantly
- Wait for statistical significance
- Typical minimum: 1-2 weeks OR
- Until you reach planned sample size
- Account for day-of-week patterns
- Consider seasonal factors

### 8. Analysis
- Check statistical significance (>95% confidence)
- Review primary metric
- Check secondary metrics (did we hurt anything?)
- Segment results:
  - New vs. returning users
  - Device type
  - Traffic source
  - Geographic location
- Look for surprising patterns

### 9. Decision Making
**Winner is Clear:**
- Implement winning variant
- Document learnings
- Plan next iteration

**No Clear Winner:**
- Document as learning
- Analyze why hypothesis was wrong
- Generate new hypothesis
- Move to next test

**Test Invalidated:**
- Document why (technical issues, external factors)
- Decide whether to re-run

### 10. Implementation & Iteration
- Implement winning variant permanently
- Remove test code
- Update documentation
- Share learnings with team
- Plan follow-up tests to compound wins

## Best Practices

### Test Design
- **One variable at a time** (unless doing multivariate)
- Test bold changes (10%+ expected lift)
- Make sure you have enough traffic
- Run tests for full business cycles
- Account for external factors (holidays, news, etc.)

### Statistical Rigor
- Don't stop tests early (even if "winning")
- Reach 95%+ statistical significance
- Have enough sample size (use calculators)
- Watch out for novelty effect
- Segment analysis carefully

### Hypothesis Quality
- Based on data and insights, not opinions
- Specific and measurable
- Explains why you expect the change
- Addresses real user problems
- Realistic about expected impact

### Test Velocity
- Run tests constantly
- Learn from failures
- Build testing into workflow
- Document everything
- Share learnings

## Common Pitfalls to Avoid

- **Stopping tests too early**: Seeing early "winner" and calling it
- **Testing too many things**: Can't isolate what drove change
- **Insufficient traffic**: Never reaching significance
- **Ignoring segments**: Missing important patterns
- **Confirmation bias**: Only seeing what you want to see
- **Not documenting**: Losing institutional knowledge
- **Testing tiny changes**: Wasting time on insignificant lifts
- **Bad tracking**: Making decisions on flawed data

## Expected Outcomes

### Successful Test:
- Clear winner identified
- Statistically significant results
- Learnings documented
- Next test ideas generated
- Winning variant implemented

### Learning Outcomes (even from "failed" tests):
- Better understanding of users
- Validated or invalidated hypothesis
- Ideas for future tests
- Data about what doesn't work

## Test Ideas by Funnel Stage

### Homepage / Landing Pages
- Headlines and value propositions
- Hero images
- CTA button copy/color/placement
- Social proof placement
- Form length and fields

### Signup / Onboarding
- Number of steps
- Form field order
- Required vs. optional fields
- Social login options
- Progress indicators
- Trust signals

### Pricing Page
- Price display format
- Plan names and features
- CTA button copy
- Free trial length
- Money-back guarantee

### Email
- Subject lines
- Sender name
- Email length
- CTA placement
- Personalization
- Send time

## Minimum Sample Size

Use this as rough guide:
- **5% conversion rate baseline**: Need ~1,000 conversions per variant
- **2% conversion rate baseline**: Need ~4,000 conversions per variant
- **1% conversion rate baseline**: Need ~16,000 conversions per variant

To detect 20% relative improvement with 95% confidence.

## Related Tasks

- [Conversion Optimization](./conversion-optimization.md)
- [Landing Page Optimization](./landing-page-optimization.md)
- [Funnel Analysis](./funnel-analysis.md)

## Tools

- A/B Testing: Optimizely, VWO, Google Optimize
- Sample Size Calculators: Evan Miller, Optimizely
- Statistical Significance: AB Test Calculator
- Analytics: Google Analytics, Mixpanel, Amplitude
- Heatmaps: Hotjar, Crazy Egg, Microsoft Clarity


