import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmiCalculator.css";

/* Edit ranges, defaults and where "Apply Now" goes. kind: "loan" | "deposit" */
const TABS = {
  "Personal Loan":         { icon: "👤", kind: "loan",    amount: [25000, 5000000, 245929],  years: [1, 7, 3],   rate: [9.99, 24, 11.99], to: "/personal-loan" },
  "Home Loan":             { icon: "🏠", kind: "loan",    amount: [500000, 100000000, 5000000], years: [1, 30, 20], rate: [8.5, 12, 9],      to: "/home-loans" },
  "Fixed Deposit":         { icon: "💰", kind: "deposit", amount: [10000, 10000000, 100000], years: [1, 10, 5],  rate: [3, 8, 7],         to: "/app/deposits" },
  "Loan Against Property": { icon: "🏢", kind: "loan",    amount: [1000000, 100000000, 3000000], years: [1, 15, 10], rate: [9, 16, 10.5],  to: "/app/loans" },
  "Car Loan":              { icon: "🚗", kind: "loan",    amount: [100000, 10000000, 800000], years: [1, 7, 5],  rate: [8.5, 18, 9.5],    to: "/car-loan" },
  "Gold Loan":             { icon: "💍", kind: "loan",    amount: [50000, 3000000, 500000],  years: [1, 7, 5],   rate: [10, 20, 12],      to: "/gold-loan" },
};

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function calculate(kind, principal, years, ratePct) {
  if (kind === "deposit") {
    // quarterly compounding
    const maturity = principal * Math.pow(1 + ratePct / 400, 4 * years);
    return { main: maturity / (years * 12), total: maturity, interest: maturity - principal };
  }
  const r = ratePct / 1200;
  const n = years * 12;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return { main: emi, total: emi * n, interest: emi * n - principal };
}

/* slider + number box */
function Field({ label, value, min, max, step, onChange, prefix, suffix, minLabel, maxLabel, format }) {
  const safe = clamp(Number.isFinite(value) ? value : min, min, max);
  const pct = ((safe - min) / (max - min)) * 100;

  return (
    <div className="ec-field">
      <div className="ec-field-top">
        <label>{label}</label>
        <div className="ec-box">
          {prefix && <span>{prefix}</span>}
          <input
            inputMode="decimal"
            value={format ? format(value) : value}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, "");
              onChange(raw === "" ? 0 : parseFloat(raw));
            }}
            onBlur={() => onChange(clamp(Number.isFinite(value) ? value : min, min, max))}
            aria-label={label}
          />
          {suffix && <span className="ec-suffix">{suffix}</span>}
        </div>
      </div>

      <input
        type="range"
        className="ec-range"
        min={min}
        max={max}
        step={step}
        value={safe}
        style={{ "--pct": `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
      />

      <div className="ec-limits">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function EmiCalculator() {
  const navigate = useNavigate();
  const names = Object.keys(TABS);

  const [tab, setTab] = useState("Personal Loan");
  const cfg = TABS[tab];

  const [amount, setAmount] = useState(cfg.amount[2]);
  const [years, setYears] = useState(cfg.years[2]);
  const [rate, setRate] = useState(cfg.rate[2]);

  const changeTab = (name) => {
    const c = TABS[name];
    setTab(name);
    setAmount(c.amount[2]);
    setYears(c.years[2]);
    setRate(c.rate[2]);
  };

  const result = useMemo(
    () =>
      calculate(
        cfg.kind,
        clamp(amount || 0, cfg.amount[0], cfg.amount[1]),
        clamp(years || 0, cfg.years[0], cfg.years[1]),
        clamp(rate || 0, cfg.rate[0], cfg.rate[1])
      ),
    [cfg, amount, years, rate]
  );

  const isDeposit = cfg.kind === "deposit";
  const safeAmount = clamp(amount || 0, cfg.amount[0], cfg.amount[1]);

  return (
    <section className="ec" id="calculators">
      <div className="home-container">
        <h2 className="ec-title">Simplify financial planning with the right tools</h2>
        <p className="ec-sub">{isDeposit ? "Plan your savings with a clear maturity estimate" : "Flexible EMIs to address your needs"}</p>

        <div className="ec-tabs" role="tablist">
          {names.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              className={tab === name ? "active" : ""}
              onClick={() => changeTab(name)}
            >
              <span aria-hidden="true">{TABS[name].icon}</span> {name}
            </button>
          ))}
        </div>

        <div className="ec-grid">
          {/* ---------- inputs ---------- */}
          <div className="ec-panel ec-inputs">
            <Field
              label={isDeposit ? "Deposit Amount" : "Loan Amount"}
              value={amount}
              min={cfg.amount[0]}
              max={cfg.amount[1]}
              step={cfg.amount[0] >= 100000 ? 10000 : 1000}
              onChange={setAmount}
              prefix="₹"
              format={(v) => (v ? Number(v).toLocaleString("en-IN") : "")}
              minLabel={inr(cfg.amount[0])}
              maxLabel={inr(cfg.amount[1])}
            />
            <Field
              label={isDeposit ? "Deposit Tenure" : "Loan Tenure"}
              value={years}
              min={cfg.years[0]}
              max={cfg.years[1]}
              step={1}
              onChange={setYears}
              minLabel={`${cfg.years[0]} year`}
              maxLabel={`${cfg.years[1]} years`}
            />
            <Field
              label="Interest Rate"
              value={rate}
              min={cfg.rate[0]}
              max={cfg.rate[1]}
              step={0.01}
              onChange={setRate}
              suffix="%"
              minLabel={`${cfg.rate[0]}% PA`}
              maxLabel={`${cfg.rate[1]}% PA`}
            />
          </div>

          {/* ---------- result ---------- */}
          <div className="ec-panel ec-result">
            <div className="ec-emi">
              <small>{isDeposit ? "Your maturity amount will be" : "Your Monthly EMI will be"}</small>
              <strong>{inr(isDeposit ? result.total : result.main)}</strong>
              <span className="ec-glow" />
            </div>

            <dl className="ec-rows">
              <div><dt>{isDeposit ? "Maturity Value" : "Amount Payable"}</dt><dd>{inr(result.total)}</dd></div>
              <div><dt>{isDeposit ? "Interest Earned" : "Interest Amount"}</dt><dd>{inr(result.interest)}</dd></div>
              <div><dt>Principal Amount</dt><dd>{inr(safeAmount)}</dd></div>
            </dl>

            <div className="ec-actions">
              <button type="button" className="ec-btn primary" onClick={() => navigate(cfg.to)}>
                Apply Now <span className="ec-chev">›</span>
              </button>
              <button
                type="button"
                className="ec-btn ghost"
                onClick={() => document.getElementById("digital-banking")?.scrollIntoView({ behavior: "smooth" })}
              >
                Know More <span className="ec-chev red">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}