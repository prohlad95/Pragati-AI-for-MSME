# Approach

Pragati is designed as a bank-facing MSME Financial Health Card. It does not replace lender judgment; it gives lenders a unified assessment layer for New-to-Credit and New-to-Bank enterprises that lack conventional documents.

## Product Thesis

Traditional credit underwriting asks: "Does this MSME have formal financial documents?"

Pragati asks: "Does this MSME show credible repayment capacity across consented alternate-data signals?"

That framing is better aligned with financial inclusion because many viable MSMEs have real cash flow, tax discipline, and digital operating history even when they lack audited statements or long bureau histories.

## Input Signal Groups

- GST: filing delay, filing consistency, taxable-sales trend
- UPI: transaction density, inflow/outflow strength, digital collections
- Account Aggregator: bank balance, cash-flow regularity, repayment behavior
- EPFO: payroll stability and employment continuity
- Trade behavior: vendor payment delay and working-capital stress

## Output

The prototype produces:

- Pragati Score from 0 to 100
- Probability of default estimate
- Suggested credit band
- Approval recommendation
- Explainability summary
- Fairness governance snapshot
- Expected-loss simulation

## Why This Is Better Than A Plain Credit Score

A single score can hide too much. Pragati shows the score, the reasons behind it, and the risk-governance context. That makes it more useful for banks, regulators, and borrowers.

## Production Extension

In a production setting, the transparent prototype engine should be replaced or enhanced with:

- Calibrated Gradient Boosting, XGBoost, or LightGBM models
- Lender-specific repayment outcome data
- SHAP explanations
- Champion-challenger model monitoring
- Bias testing across geography, gender, industry, and firm-size cohorts
- Secure consented data ingestion through approved ecosystem rails

