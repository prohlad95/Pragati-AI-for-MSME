import csv
import random
from pathlib import Path


random.seed(42)


def clamp(value, low, high):
    return max(low, min(high, value))


def make_row(idx):
    segment = random.choice(["retail", "manufacturing", "services", "food"])
    base_inflow = {
        "retail": 520_000,
        "manufacturing": 900_000,
        "services": 360_000,
        "food": 430_000,
    }[segment]
    monthly_inflow = clamp(random.gauss(base_inflow, base_inflow * 0.42), 60_000, 2_400_000)
    gst_delay = clamp(random.gauss(28, 26), 0, 120)
    upi_transactions = clamp(random.gauss(monthly_inflow / 3500, 55), 5, 520)
    sales_volatility = clamp(random.gauss(38, 20), 5, 95)
    vendor_delay = clamp(random.gauss(25, 18), 0, 90)
    average_bank_balance = clamp(random.gauss(monthly_inflow * 0.38, monthly_inflow * 0.22), 10_000, 1_200_000)
    payroll_stability = clamp(random.gauss(56, 24), 0, 100)

    risk = 0.18
    risk += gst_delay / 260
    risk += sales_volatility / 340
    risk += vendor_delay / 360
    risk -= min(monthly_inflow / 2_400_000, 0.22)
    risk -= min(average_bank_balance / 2_000_000, 0.16)
    risk -= payroll_stability / 900
    defaulted = int(random.random() < clamp(risk, 0.04, 0.78))

    return {
        "msme_id": f"MSME-{idx:05d}",
        "segment": segment,
        "monthly_inflow": round(monthly_inflow),
        "gst_delay_days": round(gst_delay, 1),
        "upi_transactions": round(upi_transactions),
        "sales_volatility_pct": round(sales_volatility, 1),
        "vendor_delay_days": round(vendor_delay, 1),
        "average_bank_balance": round(average_bank_balance),
        "payroll_stability": round(payroll_stability, 1),
        "defaulted": defaulted,
    }


def main():
    output = Path(__file__).with_name("sample_msme_data.csv")
    rows = [make_row(i) for i in range(1, 501)]
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {output}")


if __name__ == "__main__":
    main()

