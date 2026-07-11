# Pragati

AI-powered MSME Financial Health Card for alternate-data credit evaluation.

## Why This Exists

Banks often reject New-to-Credit and New-to-Bank MSMEs because traditional credit evaluation depends on audited statements, collateral history, and bureau records. Many viable enterprises instead leave stronger signals in alternate data: GST filing behavior, UPI cash-flow activity, Account Aggregator bank data, EPFO payroll stability, vendor payments, and digital sales.

Pragati converts those signals into a practical MSME Financial Health Card that helps lenders assess credit readiness faster, explain decisions clearly, and improve portfolio quality without excluding thin-file businesses by default.

## Prototype

Open the web app:

```text
app/index.html
```

The prototype runs in the browser and does not require a backend, API key, or database. This makes the GitHub submission easy for evaluators to inspect.

## What The App Shows

- MSME financial health score from 0 to 100
- Probability of default estimate
- Decision band: Approve, Review, or Defer
- Dimensional scores for cash flow, GST discipline, digital adoption, payroll stability, and liquidity
- Plain-language explanations for the strongest risk and strength factors
- Fairness governance snapshot by enterprise segment
- Expected loss simulation against a traditional-screening baseline
- ULI, OCEN, and Account Aggregator integration readiness map

## Repository Structure

```text
app/
  index.html        Browser prototype
  styles.css        Product UI styling
  app.js            Scoring, explanation, fairness, and portfolio logic

data/
  generate_synthetic_msme_data.py
  sample_msme_data.csv

docs/
  approach.md
  architecture.md
  judging-notes.md

model/
  scoring_engine.py
  model_card.md
```

## Methodology Summary

Pragati uses a transparent risk-scoring engine inspired by machine-learning credit models. For the prototype, the scoring logic is intentionally explainable and dependency-light:

- Alternate-data features are normalized into comparable 0-100 dimensions.
- A weighted financial health score is computed.
- Risk factors are converted into a probability of default estimate.
- Decision thresholds classify applications into approve, review, or defer.
- Explanation logic identifies the most important positive and negative factors.
- Fairness checks compare approval rates and default-risk levels across MSME cohorts.
- Portfolio expected loss is simulated using `Expected Loss = PD x LGD x EAD`.

In a production build, this scoring engine would be replaced or complemented with a calibrated Gradient Boosting, XGBoost, or LightGBM model trained on consented lender data.

## Important Disclaimer

This is a competition prototype. It uses synthetic/sample data and does not make real lending decisions. A production version would require consented borrower data, lender-specific calibration, RBI-compliant governance, privacy review, security controls, and human oversight.

