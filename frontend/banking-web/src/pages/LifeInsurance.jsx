import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./SavingsAccount.css";      // shared layout (sa-* classes)
import "./HealthInsurance.css";     // shared quote card (hi-* classes)

/* Edit all content freely. Plans are illustrative placeholders. */
const PLANS = {
  "Protect Life (Term)": [
    { name: "Pure Term Cover", tag: "High cover at a low cost", points: ["Pays your family a lump sum", "Choose cover up to a chosen age", "Option to add accidental death cover"] },
    { name: "Term with Return of Premium", tag: "Get premiums back at maturity", points: ["Protection plus a maturity benefit", "Fixed premium for the term", "Higher premium than pure term"] },
  ],
  "Pension Plans": [
    { name: "Guaranteed Income Plan", tag: "Steady income after retirement", points: ["Regular payouts for life", "Choose when income starts", "Spouse continuation option"] },
    { name: "Retirement Savings Plan", tag: "Build a retirement corpus", points: ["Flexible contributions", "Choose how to take the proceeds", "Tax benefits as per law"] },
  ],
  "Child Plans": [
    { name: "Education Secure Plan", tag: "Fund your child's goals", points: ["Payouts timed for education", "Premium waiver if the parent dies", "Cover continues for the child's goals"] },
  ],
  "Protect & Grow Wealth": [
    { name: "Savings with Life Cover", tag: "Save and stay protected", points: ["Life cover plus guaranteed additions", "Fixed payouts or lump sum", "Regular or limited premium"] },
    { name: "Market-linked Plan", tag: "Growth potential with cover", points: ["Choose your fund mix", "Switch between funds", "Returns not guaranteed"] },
  ],
};

const BENEFITS = [
  { icon: "🛡️", title: "Protects your family", text: "A lump sum or regular income if you're no longer around." },
  { icon: "💼", title: "Covers your commitments", text: "Loans, education and everyday costs stay taken care of." },
  { icon: "👴", title: "Plan for retirement", text: "Create an income that lasts as long as you do." },
  { icon: "🎓", title: "Secure your child's future", text: "Goals stay funded even if plans change." },
  { icon: "💸", title: "Tax benefits", text: "Premiums and benefits may qualify under applicable tax laws." },
  { icon: "📱", title: "Manage it online", text: "Pay premiums, download documents and track your policy." },
];

const STEPS = [
  { n: 1, title: "Work out your cover", text: "Use the calculator to see how much protection suits you." },
  { n: 2, title: "Pick a plan type", text: "Compare term, pension, child and savings plans." },
  { n: 3, title: "Speak to us", text: "Request a call back and our team will guide you through the application." },
];

const FAQS = [
  { q: "How much life cover do I need?", a: "A common rule of thumb is 10 to 15 times your annual income, adjusted for loans, savings and existing cover. The calculator above uses this idea. Your own situation may need more or less." },
  { q: "What is the difference between term and savings plans?", a: "Term insurance gives pure protection and costs less. Savings plans combine cover with a maturity benefit, so they cost more for the same cover." },
  { q: "When should I buy life insurance?", a: "Younger buyers usually pay lower premiums and have fewer health conditions to declare, so earlier is generally cheaper." },
  { q: "Do I have to disclose my health history?", a: "Yes. Being accurate in your application protects your claim. Hiding information can lead to a claim being rejected." },
  { q: "Who receives the money if something happens?", a: "The nominee you name in the policy receives the benefit. Keep your nominee details up to date." },
];

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const crore = (n) => (n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} crore` : n >= 100000 ? `₹${(n / 100000).toFixed(1)} lakh` : inr(n));

/* Rule of thumb only: income multiple + loans - savings - existing cover */
function recommendCover({ age, income, loans, savings, existing }) {
  const multiple = age < 35 ? 15 : age < 45 ? 12 : 10;
  return Math.max(0, income * multiple + loans - savings - existing);
}

export default function LifeInsurance() {
  const calcRef = useRef(null);
  const [tab, setTab] = useState("Protect Life (Term)");
  const [calc, setCalc] = useState({ age: 32, income: 800000, loans: 0, savings: 0, existing: 0 });
  const [lead, setLead] = useState({ name: "", mobile: "" });
  const [leadErrors, setLeadErrors] = useState({});
  const [sent, setSent] = useState(null);

  const cover = useMemo(() => recommendCover(calc), [calc]);
  const num = (k) => (e) => setCalc({ ...calc, [k]: Number(e.target.value.replace(/\D/g, "")) });
  const money = (v) => (v ? Number(v).toLocaleString("en-IN") : "");

  const toCalc = () => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const submitLead = (e) => {
    e.preventDefault();
    const er = {};
    if (lead.name.trim().length < 3) er.name = "Enter your name.";
    if (!/^[6-9]\d{9}$/.test(lead.mobile)) er.mobile = "Enter a valid 10-digit mobile number.";
    setLeadErrors(er);
    if (Object.keys(er).length) return;

    // Front-end only for now: see the note below the code.
    setSent("LI" + Date.now().toString().slice(-8));
  };

  return (
    <div className="sa-page">
      <header className="sa-header">
        <Link to="/" className="sa-brand"><span className="sa-mark">M</span>Meridian Bank</Link>
        <nav>
          <a href="#plans">Plans</a>
          <a href="#benefits">Benefits</a>
          <a href="#faq">FAQs</a>
        </nav>
        <div className="sa-header-actions">
          <Link to="/netbanking" className="sa-login">Login</Link>
          <button type="button" className="sa-btn primary" onClick={toCalc}>Check My Cover</button>
        </div>
      </header>

      {/* ---------- hero + calculator ---------- */}
      <section className="sa-hero">
        <div className="sa-wrap sa-hero-grid">
          <div>
            <p className="sa-crumbs"><Link to="/">Home</Link> › Insurance › Life Insurance</p>
            <h1>Life Insurance</h1>
            <p className="sa-lead">
              Protect the people who depend on you, plan your retirement and fund your child's future,
              with plans that fit each stage of life.
            </p>
            <div className="sa-hero-actions">
              <a href="#plans" className="sa-btn primary lg">Explore plans</a>
              <button type="button" className="sa-btn ghost lg" onClick={toCalc}>How much cover do I need?</button>
            </div>
          </div>

          <div className="hi-quote" ref={calcRef}>
            <h2>How much life cover do you need?</h2>

            <div className="hi-row two">
              <label>Your age
                <input type="number" min="18" max="65" value={calc.age}
                  onChange={(e) => setCalc({ ...calc, age: Number(e.target.value) })} />
              </label>
              <label>Annual income (₹)
                <input inputMode="numeric" value={money(calc.income)} onChange={num("income")} />
              </label>
            </div>
            <div className="hi-row two">
              <label>Loans and liabilities (₹)
                <input inputMode="numeric" value={money(calc.loans)} onChange={num("loans")} />
              </label>
              <label>Savings and investments (₹)
                <input inputMode="numeric" value={money(calc.savings)} onChange={num("savings")} />
              </label>
            </div>
            <div className="hi-row">
              <label>Existing life cover (₹)
                <input inputMode="numeric" value={money(calc.existing)} onChange={num("existing")} />
              </label>
            </div>

            <div className="hi-result">
              <small>Suggested life cover</small>
              <strong>{crore(cover)}</strong>
              <em>Rule of thumb: income × 10–15, plus loans, minus savings and existing cover</em>
            </div>
            <p className="hi-note">A starting point only. Your actual needs depend on dependants, goals and lifestyle.</p>

            {sent ? (
              <div className="hi-sent" role="status">
                <strong>Request received</strong>
                <span>Reference {sent}. We'll call {lead.name.split(" ")[0]} on +91 {lead.mobile}.</span>
              </div>
            ) : (
              <form onSubmit={submitLead} noValidate>
                <div className="hi-row two">
                  <label className={leadErrors.name ? "err" : ""}>Name
                    <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} autoComplete="name" />
                    {leadErrors.name && <span className="hi-err">{leadErrors.name}</span>}
                  </label>
                  <label className={leadErrors.mobile ? "err" : ""}>Mobile
                    <input inputMode="numeric" maxLength={10} value={lead.mobile}
                      onChange={(e) => setLead({ ...lead, mobile: e.target.value.replace(/\D/g, "") })} />
                    {leadErrors.mobile && <span className="hi-err">{leadErrors.mobile}</span>}
                  </label>
                </div>
                <button type="submit" className="sa-btn primary hi-submit">Request a call back</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ---------- plans ---------- */}
      <section className="sa-section" id="plans">
        <div className="sa-wrap">
          <h2>Choose the protection that fits your goals</h2>
          <p className="sa-sub">Pick a category to see the plans available.</p>

          <div className="sa-tabs" role="tablist">
            {Object.keys(PLANS).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t}
                className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t} <span>{PLANS[t].length}</span>
              </button>
            ))}
          </div>

          <div className="sa-cards">
            {PLANS[tab].map((p) => (
              <article className="sa-card" key={p.name}>
                <h3>{p.name}</h3>
                <p className="sa-tag">{p.tag}</p>
                <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                <button type="button" className="sa-btn primary" onClick={toCalc}>Get Advice</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- benefits ---------- */}
      <section className="sa-section alt" id="benefits">
        <div className="sa-wrap">
          <h2>Why life insurance matters</h2>
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

      {/* ---------- steps ---------- */}
      <section className="sa-section">
        <div className="sa-wrap">
          <h2>How it works</h2>
          <ol className="sa-steps">
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
          <h2>Give your family a secure tomorrow</h2>
          <button type="button" className="sa-btn light lg" onClick={toCalc}>Check My Cover</button>
        </div>
      </section>

      <footer className="sa-footer">
        <div className="sa-wrap">
          <span>© {new Date().getFullYear()} Meridian Bank</span>
          <span>Insurance is subject to insurer terms. Read the policy document carefully before buying.</span>
        </div>
      </footer>
    </div>
  );
}