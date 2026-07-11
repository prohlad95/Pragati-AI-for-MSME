from dataclasses import dataclass


def clamp(value, minimum=0.0, maximum=100.0):
    return max(minimum, min(maximum, value))


def score_high_good(value, low, high):
    return clamp(((value - low) / (high - low)) * 100)


def score_low_good(value, low, high):
    return clamp(((high - value) / (high - low)) * 100)


@dataclass
class MSMEProfile:
    monthly_inflow: float
    gst_delay_days: float
    upi_transactions: float
    sales_volatility_pct: float
    vendor_delay_days: float
    average_bank_balance: float
    payroll_stability: float
    gst_connected: bool = True
    upi_connected: bool = True
    aa_connected: bool = True
    epfo_connected: bool = False


def score_profile(profile: MSMEProfile):
    cash_flow = (
        score_high_good(profile.monthly_inflow, 80_000, 1_400_000) * 0.58
        + score_high_good(profile.upi_transactions, 20, 380) * 0.42
    )
    compliance = score_low_good(profile.gst_delay_days, 0, 95)
    stability = score_low_good(profile.sales_volatility_pct, 8, 85)
    vendor_discipline = score_low_good(profile.vendor_delay_days, 0, 70)
    liquidity = score_high_good(profile.average_bank_balance, 25_000, 700_000)
    payroll = profile.payroll_stability if profile.epfo_connected else profile.payroll_stability * 0.65
    consent_coverage = (
        sum([profile.gst_connected, profile.upi_connected, profile.aa_connected, profile.epfo_connected])
        / 4
        * 100
    )

    health_score = round(
        cash_flow * 0.21
        + compliance * 0.19
        + stability * 0.16
        + vendor_discipline * 0.13
        + liquidity * 0.15
        + consent_coverage * 0.08
        + payroll * 0.08
    )

    risk = 68 - health_score * 0.62
    risk += 11 if profile.gst_delay_days > 60 else 5 if profile.gst_delay_days > 30 else 0
    risk += 9 if profile.sales_volatility_pct > 65 else 4 if profile.sales_volatility_pct > 45 else 0
    risk += 7 if profile.vendor_delay_days > 45 else 0
    risk += 5 if not profile.aa_connected else 0
    risk += 8 if not profile.gst_connected else 0
    pd = clamp(risk, 4, 78) / 100

    if pd < 0.20 and health_score >= 72:
        decision = "Approve"
    elif pd < 0.40 and health_score >= 50:
        decision = "Review"
    else:
        decision = "Defer"

    multiplier = {"Approve": 1.45, "Review": 0.82, "Defer": 0.32}[decision]
    suggested_limit = max(75_000, min(profile.monthly_inflow * multiplier, 2_500_000))
    expected_loss = suggested_limit * pd * 0.45

    return {
        "health_score": health_score,
        "probability_of_default": round(pd, 4),
        "decision": decision,
        "suggested_limit": round(suggested_limit),
        "expected_loss": round(expected_loss),
        "dimensions": {
            "cash_flow": round(cash_flow, 1),
            "gst_compliance": round(compliance, 1),
            "sales_stability": round(stability, 1),
            "vendor_discipline": round(vendor_discipline, 1),
            "liquidity": round(liquidity, 1),
            "consent_coverage": round(consent_coverage, 1),
            "payroll_stability": round(payroll, 1),
        },
    }


if __name__ == "__main__":
    sample = MSMEProfile(
        monthly_inflow=650_000,
        gst_delay_days=18,
        upi_transactions=185,
        sales_volatility_pct=31,
        vendor_delay_days=21,
        average_bank_balance=260_000,
        payroll_stability=58,
    )
    print(score_profile(sample))

