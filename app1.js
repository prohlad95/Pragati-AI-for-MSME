const inputs = {
  segment: document.querySelector("#segment"),
  monthlyInflow: document.querySelector("#monthlyInflow"),
  gstDelay: document.querySelector("#gstDelay"),
  upiDensity: document.querySelector("#upiDensity"),
  salesVolatility: document.querySelector("#salesVolatility"),
  vendorDelay: document.querySelector("#vendorDelay"),
  bankBalance: document.querySelector("#bankBalance"),
  payrollStability: document.querySelector("#payrollStability"),
  gstConnected: document.querySelector("#gstConnected"),
  upiConnected: document.querySelector("#upiConnected"),
  aaConnected: document.querySelector("#aaConnected"),
  epfoConnected: document.querySelector("#epfoConnected")
};

const presets = {
  balanced: {
    segment: "retail",
    monthlyInflow: 650000,
    gstDelay: 18,
    upiDensity: 185,
    salesVolatility: 31,
    vendorDelay: 21,
    bankBalance: 260000,
    payrollStability: 58,
    gstConnected: true,
    upiConnected: true,
    aaConnected: true,
    epfoConnected: false
  },
  growth: {
    segment: "manufacturing",
    monthlyInflow: 1350000,
    gstDelay: 7,
    upiDensity: 320,
    salesVolatility: 22,
    vendorDelay: 12,
    bankBalance: 620000,
    payrollStability: 81,
    gstConnected: true,
    upiConnected: true,
    aaConnected: true,
    epfoConnected: true
  },
  thin: {
    segment: "services",
    monthlyInflow: 220000,
    gstDelay: 64,
    upiDensity: 58,
    salesVolatility: 68,
    vendorDelay: 49,
    bankBalance: 70000,
    payrollStability: 24,
    gstConnected: true,
    upiConnected: true,
    aaConnected: false,
    epfoConnected: false
  }
};

const labels = {
  retail: "Retail trader assessment",
  manufacturing: "Small manufacturer assessment",
  services: "Local services assessment",
  food: "Food business assessment"
};

const formatRs = value => {
  if (value >= 10000000) return `Rs. ${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `Rs. ${(value / 100000).toFixed(1)}L`;
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const scoreHighGood = (value, low, high) => clamp(((value - low) / (high - low)) * 100);
const scoreLowGood = (value, low, high) => clamp(((high - value) / (high - low)) * 100);

function getProfile() {
  return {
    segment: inputs.segment.value,
    monthlyInflow: Number(inputs.monthlyInflow.value),
    gstDelay: Number(inputs.gstDelay.value),
    upiDensity: Number(inputs.upiDensity.value),
    salesVolatility: Number(inputs.salesVolatility.value),
    vendorDelay: Number(inputs.vendorDelay.value),
    bankBalance: Number(inputs.bankBalance.value),
    payrollStability: Number(inputs.payrollStability.value),
    gstConnected: inputs.gstConnected.checked,
    upiConnected: inputs.upiConnected.checked,
    aaConnected: inputs.aaConnected.checked,
    epfoConnected: inputs.epfoConnected.checked
  };
}

function calculate(profile) {
  const cashFlow = scoreHighGood(profile.monthlyInflow, 80000, 1400000) * 0.58 +
    scoreHighGood(profile.upiDensity, 20, 380) * 0.42;
  const compliance = scoreLowGood(profile.gstDelay, 0, 95);
  const stability = scoreLowGood(profile.salesVolatility, 8, 85);
  const vendorDiscipline = scoreLowGood(profile.vendorDelay, 0, 70);
  const liquidity = scoreHighGood(profile.bankBalance, 25000, 700000);
  const payroll = profile.epfoConnected ? profile.payrollStability : profile.payrollStability * 0.65;
  const consentCoverage = [
    profile.gstConnected,
    profile.upiConnected,
    profile.aaConnected,
    profile.epfoConnected
  ].filter(Boolean).length / 4 * 100;

  const dimensions = [
    ["Cash-flow strength", cashFlow, "#147d78"],
    ["GST compliance", compliance, "#4e9f3d"],
    ["Sales stability", stability, "#2f6fa7"],
    ["Vendor discipline", vendorDiscipline, "#c98822"],
    ["Liquidity buffer", liquidity, "#7460a8"],
    ["Consent coverage", consentCoverage, "#4f758b"],
    ["Payroll stability", payroll, "#8a6b35"]
  ];

  const healthScore = Math.round(
    cashFlow * 0.21 +
    compliance * 0.19 +
    stability * 0.16 +
    vendorDiscipline * 0.13 +
    liquidity * 0.15 +
    consentCoverage * 0.08 +
    payroll * 0.08
  );

  let risk = 68 - healthScore * 0.62;
  risk += profile.gstDelay > 60 ? 11 : profile.gstDelay > 30 ? 5 : 0;
  risk += profile.salesVolatility > 65 ? 9 : profile.salesVolatility > 45 ? 4 : 0;
  risk += profile.vendorDelay > 45 ? 7 : 0;
  risk += !profile.aaConnected ? 5 : 0;
  risk += !profile.gstConnected ? 8 : 0;
  risk = clamp(risk, 4, 78);

  const pd = risk / 100;
  const decision = pd < 0.2 && healthScore >= 72 ? "Approve" : pd < 0.4 && healthScore >= 50 ? "Review" : "Defer";
  const suggestedLimit = Math.max(75000, Math.min(profile.monthlyInflow * (decision === "Approve" ? 1.45 : decision === "Review" ? 0.82 : 0.32), 2500000));
  const lgd = 0.45;
  const expectedLoss = suggestedLimit * pd * lgd;

  const sorted = [...dimensions].sort((a, b) => a[1] - b[1]);
  const risks = sorted.slice(0, 3).map(([name, value]) => ({
    type: "risk",
    title: `${name} needs attention`,
    body: explanationFor(name, value, profile)
  }));
  const strengths = sorted.slice(-2).reverse().map(([name, value]) => ({
    type: "strength",
    title: `${name} is a strength`,
    body: `${Math.round(value)}/100 score supports stronger credit readiness and lowers the estimated default probability.`
  }));

  return {
    dimensions,
    healthScore,
    pd,
    decision,
    suggestedLimit,
    expectedLoss,
    explanations: [...risks, ...strengths],
    aiLossRate: clamp(pd * 0.45 * 100 + 2.2, 4, 19),
    baselineLossRate: clamp(pd * 0.45 * 100 + 10.9, 12, 27)
  };
}

function explanationFor(name, value, profile) {
  if (name === "GST compliance") return `GST filing delay is ${profile.gstDelay} days. Faster filing would improve compliance confidence for banks.`;
  if (name === "Sales stability") return `Sales volatility is ${profile.salesVolatility}%. High volatility can weaken repayment predictability.`;
  if (name === "Vendor discipline") return `Vendor payment delay is ${profile.vendorDelay} days, which may signal working-capital stress.`;
  if (name === "Liquidity buffer") return `Average bank balance is ${formatRs(profile.bankBalance)}, limiting short-term repayment cushion.`;
  if (name === "Consent coverage") return `Only some consented data sources are connected, so the lender has less verified evidence.`;
  if (name === "Payroll stability") return `EPFO/payroll signal is ${profile.epfoConnected ? "available" : "not fully available"}, reducing confidence in employment stability.`;
  return `Digital inflow and transaction density are below the stronger MSME benchmark for this product.`;
}

function render() {
  const profile = getProfile();
  const result = calculate(profile);

  document.querySelector("#businessTitle").textContent = labels[profile.segment];
  document.querySelector("#healthScore").textContent = result.healthScore;
  document.querySelector("#pdMetric").textContent = `${(result.pd * 100).toFixed(1)}%`;
  document.querySelector("#limitMetric").textContent = formatRs(result.suggestedLimit);
  document.querySelector("#lossMetric").textContent = formatRs(result.expectedLoss);

  const pill = document.querySelector("#decisionPill");
  pill.textContent = result.decision;
  pill.className = `status-pill ${result.decision.toLowerCase()}`;

  const headline = document.querySelector("#scoreHeadline");
  const summary = document.querySelector("#scoreSummary");
  if (result.decision === "Approve") {
    headline.textContent = "Credit-ready MSME";
    summary.textContent = "The enterprise has strong alternate-data evidence and can move quickly into credit offer evaluation.";
  } else if (result.decision === "Review") {
    headline.textContent = "Promising MSME with review triggers";
    summary.textContent = "The enterprise should not be rejected automatically. A lender can review the highlighted risk signals.";
  } else {
    headline.textContent = "Defer with improvement path";
    summary.textContent = "The enterprise needs stronger compliance, liquidity, or cash-flow evidence before credit onboarding.";
  }

  const circumference = 414.69;
  const offset = circumference - (result.healthScore / 100) * circumference;
  const ring = document.querySelector("#scoreRing");
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = result.healthScore >= 72 ? "#4e9f3d" : result.healthScore >= 50 ? "#c98822" : "#bd4a42";

  document.querySelector("#dimensionBars").innerHTML = result.dimensions.map(([name, value, color]) => `
    <div class="bar-item">
      <div class="bar-meta"><span>${name}</span><strong>${Math.round(value)}</strong></div>
      <div class="track"><div style="width:${Math.round(value)}%; background:${color}"></div></div>
    </div>
  `).join("");

  document.querySelector("#explanationList").innerHTML = result.explanations.map(item => `
    <div class="explanation ${item.type === "risk" ? "risk" : ""}">
      <i></i>
      <div><strong>${item.title}</strong><span>${item.body}</span></div>
    </div>
  `).join("");

  document.querySelector("#aiLossRate").textContent = `${result.aiLossRate.toFixed(1)}%`;
  document.querySelector("#baselineLossRate").textContent = `${result.baselineLossRate.toFixed(1)}%`;
  document.querySelector("#aiLossBar").style.width = `${result.aiLossRate * 3.4}%`;
  document.querySelector("#baselineLossBar").style.width = `${result.baselineLossRate * 3.4}%`;
  const reduction = (1 - result.aiLossRate / result.baselineLossRate) * 100;
  document.querySelector("#portfolioInsight").textContent = `Estimated portfolio loss reduction: ${reduction.toFixed(1)}%.`;

  renderFairness(result);
  renderLabels(profile);
}

function renderFairness(result) {
  const baseApproval = result.decision === "Approve" ? 74 : result.decision === "Review" ? 52 : 29;
  const cohorts = [
    ["Micro", baseApproval - 5, result.pd * 100 + 2],
    ["Small", baseApproval + 2, result.pd * 100],
    ["Women-led", baseApproval - 1, result.pd * 100 + 1],
    ["Rural", baseApproval - 4, result.pd * 100 + 3]
  ];
  const reference = cohorts[1][1];
  document.querySelector("#fairnessRows").innerHTML = cohorts.map(([name, approval, risk]) => {
    const dir = approval / reference;
    const status = dir >= 0.8 && dir <= 1.25 ? "dir-pass" : "dir-review";
    return `
      <tr>
        <td>${name}</td>
        <td>${approval.toFixed(1)}%</td>
        <td>${risk.toFixed(1)}%</td>
        <td class="${status}">${dir.toFixed(2)}</td>
      </tr>
    `;
  }).join("");
}

function renderLabels(profile) {
  document.querySelector("#monthlyInflowValue").textContent = formatRs(profile.monthlyInflow);
  document.querySelector("#gstDelayValue").textContent = `${profile.gstDelay} days`;
  document.querySelector("#upiDensityValue").textContent = `${profile.upiDensity} tx/month`;
  document.querySelector("#salesVolatilityValue").textContent = `${profile.salesVolatility}%`;
  document.querySelector("#vendorDelayValue").textContent = `${profile.vendorDelay} days`;
  document.querySelector("#bankBalanceValue").textContent = formatRs(profile.bankBalance);
  document.querySelector("#payrollStabilityValue").textContent = `${profile.payrollStability}/100`;
}

function applyPreset(name) {
  const preset = presets[name];
  Object.entries(preset).forEach(([key, value]) => {
    if (typeof value === "boolean") inputs[key].checked = value;
    else inputs[key].value = value;
  });
  document.querySelectorAll(".preset").forEach(button => {
    button.classList.toggle("is-active", button.dataset.preset === name);
  });
  render();
}

Object.values(inputs).forEach(input => input.addEventListener("input", render));
document.querySelectorAll(".preset").forEach(button => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});
document.querySelector("#resetProfile").addEventListener("click", () => applyPreset("balanced"));

applyPreset("balanced");

