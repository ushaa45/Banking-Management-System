import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./SavingsAccount.css";      // shared layout (sa-* classes)
import "./HealthInsurance.css";     // shared form card (hi-* classes)
import "./HomeLoanApply.css";

/* Edit all content freely. Rates and terms are illustrative placeholders. */
const LOAN_TYPES = {
  "Home Loan": [
    { name: "Home Loan", tag: "Buy or build your dream home", points: ["Flexible tenure up to 30 years", "Competitive interest rates", "Easy online application"] },
  ],
  "Plot & Construction": [
    { name: "Plot Loan", tag: "Buy a plot to build on", points: ["Finance for approved plots", "Convert to a construction loan later", "Flexible repayment"] },
    { name: "Home Construction Loan", tag: "Build in stages", points: ["Money released as work progresses", "Pay interest only on what you draw", "Simple documentation"] },
  ],
  "Renovation & Extension": [
    { name: "Home Renovation Loan", tag: "Refresh what you already own", points: ["Repairs, painting and upgrades", "Quick processing", "Flexible tenure"] },
    { name: "Home Extension Loan", tag: "Add space to your home", points: ["Extra rooms or floors", "Linked to your existing loan", "Structured disbursal"] },
  ],
  "Balance Transfer": [
    { name: "Balance Transfer & Top-up", tag: "Move your loan, lower your cost", points: ["Switch from another lender", "Possible rate savings", "Optional top-up for other needs"] },
  ],
};

const BENEFITS = [
  { icon: "🏠", title: "Finance for your home", text: "Loans for buying, building, renovating or extending." },
  { icon: "📉", title: "Competitive rates", text: "Interest rates that depend on your profile and the loan." },
  { icon: "⏳", title: "Long tenures", text: "Spread repayments over up to 30 years to keep EMIs comfortable." },
  { icon: "📱", title: "Digital process", text: "Apply online, upload documents and track your application." },
  { icon: "🔁", title: "Flexible repayment", text: "Part-prepay when you can. Terms apply." },
  { icon: "🤝", title: "Guidance at every step", text: "A relationship manager helps you from application to disbursal." },
];

const STEPS = [
  { n: 1, title: "Share your details", text: "Fill in the short form and tell us the loan amount you need." },
  { n: 2, title: "Get a call back", text: "Our home loan team contacts you to understand your requirement." },
  { n: 3, title: "Submit documents", text: "Provide identity, income and property documents for verification." },
  { n: 4, title: "Approval and disbursal", text: "Once approved, the loan is disbursed as per the agreed terms." },
];

const ELIGIBILITY = ["Indian resident aged 21 to 65", "Salaried or self-employed with stable income", "Good credit history", "Property that meets legal and technical checks"];
const DOCS = ["Identity and address proof", "PAN card", "Last 3 months' salary slips or last 2 years' ITR", "6 months' bank statements", "Property documents (for approved properties)"];

const FAQS = [
  { q: "How much home loan can I get?", a: "It depends on your income, existing EMIs, age, credit history and the property value. The eligibility estimator below gives a rough idea." },
  { q: "What is the maximum tenure?", a: "Tenures generally go up to 30 years, subject to your age and the lender's policy." },
  { q: "Can I prepay my loan?", a: "Usually yes. Terms differ by loan type, so check the sanction letter for charges, if any." },
  { q: "What is a balance transfer?", a: "Moving your outstanding loan from another lender to a new one, usually to get a better rate or terms." },
  { q: "What affects my interest rate?", a: "Your credit score, income profile, loan amount, tenure and the type of property all play a part." },
];

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const money = (v) => (v ? Number(v).toLocaleString("en-IN") : "");
const lakhCr = (n) => (n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} crore` : `₹${(n / 100000).toFixed(1)} lakh`);

function emiOf(principal, annualRate, years) {
  const r = annualRate / 1200;
  const n = years * 12;
  if (!principal || !r || !n) return 0;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/* loan you can afford if EMI is capped at 50% of income minus existing EMIs */
function affordableLoan(income, existing, annualRate, years) {
  const maxEmi = Math.max(0, income * 0.5 - existing);
  const r = annualRate / 1200;
  const n = years * 12;
  if (!maxEmi || !r || !n) return { maxEmi, loan: 0 };
  return { maxEmi, loan: (maxEmi * (1 - Math.pow(1 + r, -n))) / r };
}

export default function HomeLoanApply() {
  const formRef = useRef(null);
  const [tab, setTab] = useState("Home Loan");

  /* lead form */
  const [lead, setLead] = useState({ name: "", mobile: "", email: "", city: "", amount: "", employment: "Salaried" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);

  /* calculators */
  const [calc, setCalc] = useState({ amount: 5000000, years: 20, rate: 8.75 });
  const [elig, setElig] = useState({ income: 100000, existing: 0 });

  const emi = useMemo(() => emiOf(calc.amount, calc.rate, calc.years), [calc]);
  const totalPay = emi * calc.years * 12;
  const afford = useMemo(() => affordableLoan(elig.income, elig.existing, calc.rate, calc.years), [elig, calc]);

  const numField = (setter, obj, key) => (e) => setter({ ...obj, [key]: Number(e.target.value.replace(/\D/g, "")) });
  const toForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const handleLead = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "mobile") v = v.replace(/\D/g, "").slice(0, 10);
    if (name === "amount") v = v.replace(/\D/g, "");
    setLead((l) => ({ ...l, [name]: v }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (lead.name.trim().length < 3) er.name = "Enter your name.";
    if (!/^[6-9]\d{9}$/.test(lead.mobile)) er.mobile = "Enter a valid 10-digit mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) er.email = "Enter a valid email.";
    if (lead.city.trim().length < 2) er.city = "Enter your city.";
    if (!(Number(lead.amount) >= 100000)) er.amount = "Enter a loan amount of at least ₹1,00,000.";
    setErrors(er);
    if (Object.keys(er).length) return;

    // Front-end only for now: see the note below the code.
    setSent("HL" + Date.now().toString().slice(-8));
  };

  const fieldCls = (k) => (errors[k] ? "err" : "");

  return (
    <div className="sa-page">
      <header className="sa-header">
        <Link to="/" className="sa-brand"><span className="sa-mark">M</span>Meridian Bank</Link>
        <nav>
          <a href="#types">Loan types</a>
          <a href="#calculators">Calculators</a>
          <a href="#apply-steps">How it works</a>
          <a href="#faq">FAQs</a>
        </nav>
        <div className="sa-header-actions">
          <Link to="/netbanking" className="sa-login">Login</Link>
          <button type="button" className="sa-btn primary" onClick={toForm}>Apply Now</button>
        </div>
      </header>

      {/* ---------- hero + lead form ---------- */}
      <section className="sa-hero">
        <div className="sa-wrap sa-hero-grid">
          <div>
            <p className="sa-crumbs"><Link to="/">Home</Link> › Loans › Home Loans</p>
            <h1>Home Loans that help you move in sooner</h1>
            <p className="sa-lead">
              Buy, build, renovate or extend your home with flexible tenures and a simple online
              application. Share your details and our team will call you back.
            </p>
            <ul className="hl-points">
              <li>Tenure up to 30 years</li>
              <li>Quick callback from a home loan expert</li>
              <li>Balance transfer and top-up options</li>
            </ul>
          </div>

          <div className="hi-quote" ref={formRef}>
            <h2>Apply for a home loan</h2>

            {sent ? (
              <div className="hi-sent" role="status">
                <strong>Request received</strong>
                <span>Reference {sent}. We'll call {lead.name.split(" ")[0]} on +91 {lead.mobile} soon.</span>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="hi-row">
                  <label className={fieldCls("name")}>Full name
                    <input name="name" value={lead.name} onChange={handleLead} autoComplete="name" />
                    {errors.name && <span className="hi-err">{errors.name}</span>}
                  </label>
                </div>
                <div className="hi-row two">
                  <label className={fieldCls("mobile")}>Mobile number
                    <input name="mobile" inputMode="numeric" value={lead.mobile} onChange={handleLead} />
                    {errors.mobile && <span className="hi-err">{errors.mobile}</span>}
                  </label>
                  <label className={fieldCls("email")}>Email
                    <input name="email" type="email" value={lead.email} onChange={handleLead} autoComplete="email" />
                    {errors.email && <span className="hi-err">{errors.email}</span>}
                  </label>
                </div>
                <div className="hi-row two">
                  <label className={fieldCls("city")}>City
                    <input name="city" value={lead.city} onChange={handleLead} />
                    {errors.city && <span className="hi-err">{errors.city}</span>}
                  </label>
                  <label className={fieldCls("amount")}>Loan amount (₹)
                    <input name="amount" inputMode="numeric" value={money(lead.amount)} onChange={handleLead} />
                    {errors.amount && <span className="hi-err">{errors.amount}</span>}
                  </label>
                </div>
                <div className="hi-row">
                  <label>Employment type
                    <select name="employment" value={lead.employment} onChange={handleLead}>
                      <option>Salaried</option><option>Self-employed</option><option>Business</option><option>Professional</option>
                    </select>
                  </label>
                </div>
                <p className="hi-note">By submitting, you agree to be contacted about this application.</p>
                <button type="submit" className="sa-btn primary hi-submit">Request a call back</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ---------- loan types ---------- */}
      <section className="sa-section" id="types">
        <div className="sa-wrap">
          <h2>A home loan for every need</h2>
          <p className="sa-sub">Pick a category to see what's available.</p>

          <div className="sa-tabs" role="tablist">
            {Object.keys(LOAN_TYPES).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t}
                className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t} <span>{LOAN_TYPES[t].length}</span>
              </button>
            ))}
          </div>

          <div className="sa-cards">
            {LOAN_TYPES[tab].map((p) => (
              <article className="sa-card" key={p.name}>
                <h3>{p.name}</h3>
                <p className="sa-tag">{p.tag}</p>
                <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                <button type="button" className="sa-btn primary" onClick={toForm}>Apply Now</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- calculators ---------- */}
      <section className="sa-section alt" id="calculators">
        <div className="sa-wrap">
          <h2>Plan your home loan</h2>
          <p className="sa-sub">Estimates only. Your actual offer depends on your profile and our assessment.</p>

          <div className="hl-calcs">
            <div className="hl-panel">
              <h3>EMI calculator</h3>
              <label>Loan amount (₹)
                <input inputMode="numeric" value={money(calc.amount)} onChange={numField(setCalc, calc, "amount")} />
              </label>
              <label>Tenure: {calc.years} years
                <input type="range" min="1" max="30" value={calc.years}
                  onChange={(e) => setCalc({ ...calc, years: Number(e.target.value) })} />
              </label>
              <label>Interest rate: {calc.rate}% p.a.
                <input type="range" min="7" max="14" step="0.05" value={calc.rate}
                  onChange={(e) => setCalc({ ...calc, rate: Number(e.target.value) })} />
              </label>

              <div className="hl-result">
                <small>Monthly EMI</small>
                <strong>{inr(emi)}</strong>
                <div><span>Total interest</span><b>{inr(totalPay - calc.amount)}</b></div>
                <div><span>Total payable</span><b>{inr(totalPay)}</b></div>
              </div>
            </div>

            <div className="hl-panel">
              <h3>Loan eligibility estimator</h3>
              <label>Monthly income (₹)
                <input inputMode="numeric" value={money(elig.income)} onChange={numField(setElig, elig, "income")} />
              </label>
              <label>Existing EMIs per month (₹)
                <input inputMode="numeric" value={money(elig.existing)} onChange={numField(setElig, elig, "existing")} />
              </label>

              <div className="hl-result">
                <small>You may be eligible for about</small>
                <strong>{afford.loan > 0 ? lakhCr(afford.loan) : "—"}</strong>
                <div><span>Affordable EMI</span><b>{inr(afford.maxEmi)}</b></div>
                <div><span>Uses tenure and rate above</span><b>{calc.years} yrs, {calc.rate}%</b></div>
              </div>
              <p className="hi-note">Assumes your total EMIs stay within 50% of your monthly income.</p>
              <button type="button" className="sa-btn primary" onClick={toForm}>Apply Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- benefits ---------- */}
      <section className="sa-section">
        <div className="sa-wrap">
          <h2>Why choose us for your home loan</h2>
          <div className="sa-benefits">
            {BENEFITS.map((b) => (
              <div className="sa-benefit" key={b.title}>
                <span className="sa-icon" aria-hidden="true">{b.icon}</span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- eligibility + docs ---------- */}
      <section className="sa-section alt">
        <div className="sa-wrap sa-two">
          <div className="sa-panel">
            <h2>Eligibility</h2>
            <ul className="sa-ticks">{ELIGIBILITY.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
          <div className="sa-panel">
            <h2>Documents needed</h2>
            <ul className="sa-ticks">{DOCS.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* ---------- steps ---------- */}
      <section className="sa-section" id="apply-steps">
        <div className="sa-wrap">
          <h2>How it works</h2>
          <ol className="sa-steps hl-steps">
            {STEPS.map((s) => (
              <li key={s.n}><span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="sa-section alt" id="faq">
        <div className="sa-wrap sa-narrow">
          <h2>Frequently asked questions</h2>
          {FAQS.map((f) => (
            <details className="sa-faq" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </section>

      <section className="sa-cta">
        <div className="sa-wrap">
          <h2>Ready to own your home?</h2>
          <button type="button" className="sa-btn light lg" onClick={toForm}>Apply Now</button>
        </div>
      </section>

      <footer className="sa-footer">
        <div className="sa-wrap">
          <span>© {new Date().getFullYear()} Meridian Bank</span>
          <span>Loans are subject to eligibility, credit approval and terms and conditions.</span>
        </div>
      </footer>
    </div>
  );
}