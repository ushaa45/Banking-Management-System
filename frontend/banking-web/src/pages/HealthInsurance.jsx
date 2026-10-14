import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./SavingsAccount.css";      // shared layout (sa-* classes)
import "./HealthInsurance.css";

/* Edit all content freely. Plans and numbers are illustrative placeholders. */
const PLANS = {
  Mediclaim: [
    { name: "Individual Health Plan", tag: "Hospital cover for one person", points: ["Cashless hospitalisation", "Pre and post hospitalisation costs", "Day-care procedures covered"] },
    { name: "Family Floater Plan", tag: "One cover shared by the family", points: ["Spouse, children and parents", "Single sum insured for all", "Annual health check-up"] },
  ],
  "Super Top-Up": [
    { name: "Super Top-Up Plan", tag: "Extra cover once your base limit is crossed", points: ["Affordable higher cover", "Works with any base policy", "Chosen deductible"] },
  ],
  "Critical Illness": [
    { name: "Critical Illness Cover", tag: "Lump sum on diagnosis", points: ["Pays out on diagnosis", "Use the money as you see fit", "Covers major listed illnesses"] },
  ],
  "Personal Accident": [
    { name: "Personal Accident Cover", tag: "Protection against accidental injury", points: ["Accidental death benefit", "Permanent disability cover", "Optional temporary disability benefit"] },
  ],
};

const BENEFITS = [
  { icon: "🏥", title: "Cashless treatment", text: "Get treated at network hospitals without paying upfront." },
  { icon: "👨‍👩‍👧‍👦", title: "Cover for the family", text: "Include your spouse, children and parents in one policy." },
  { icon: "📄", title: "Simple paperwork", text: "Buy online, store your policy digitally and track claims." },
  { icon: "🩺", title: "Health check-ups", text: "Preventive check-ups included on many plans." },
  { icon: "💸", title: "Tax benefits", text: "Premiums may qualify for deductions under applicable tax laws." },
  { icon: "🔁", title: "Easy renewal", text: "Renew online and keep your cover continuous." },
];

const STEPS = [
  { n: 1, title: "Tell us who needs cover", text: "Share age, members and the cover amount you want." },
  { n: 2, title: "Compare and choose", text: "Review the indicative premium and pick a plan." },
  { n: 3, title: "Get your policy", text: "Our team contacts you to complete the application and issue the policy." },
];

const COVERED = ["Hospitalisation and room rent", "Day-care procedures", "Pre and post hospitalisation expenses", "Ambulance charges", "Accidental injury treatment"];
const NOT_COVERED = ["Cosmetic and elective procedures (unless medically necessary)", "Waiting-period conditions until the period is over", "Treatment outside policy terms", "Intentional self-injury", "Unlisted or experimental treatments"];

const FAQS = [
  { q: "What is the difference between Mediclaim and a critical illness plan?", a: "Mediclaim reimburses or pays hospital bills up to the sum insured. A critical illness plan pays a fixed lump sum when you're diagnosed with a listed illness, whatever the bill." },
  { q: "What is a super top-up?", a: "A super top-up adds cover once your claims in a year cross a chosen limit. It's an affordable way to increase cover on top of an existing policy." },
  { q: "Can I cover my parents?", a: "Most plans allow parents to be included. Premiums depend on the oldest member's age, so you may prefer a separate plan for them." },
  { q: "Is there a waiting period?", a: "Yes. Most policies have an initial waiting period and a longer one for pre-existing conditions. Check the policy terms before you buy." },
  { q: "How do I make a claim?", a: "For planned treatment, inform the insurer ahead of time and use a network hospital for cashless care. For emergencies, inform them within the time stated in your policy." },
];

/* Rough per-lakh yearly rate by age band: illustrative only. */
const rateFor = (age) => (age < 30 ? 55 : age < 40 ? 70 : age < 50 ? 105 : age < 60 ? 170 : 260);

function estimate({ age, members, cover }) {
  const base = rateFor(age) * (cover / 100000);
  const extra = (members - 1) * 0.6;              // each extra member adds 60%
  const yearly = base * (1 + extra);
  return { yearly, monthly: yearly / 12 };
}

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function HealthInsurance() {
  const quoteRef = useRef(null);

  const [tab, setTab] = useState("Mediclaim");
  const [plan, setPlan] = useState("Individual Health Plan");
  const [q, setQ] = useState({ age: 32, members: 1, cover: 500000 });
  const [lead, setLead] = useState({ name: "", mobile: "" });
  const [leadErrors, setLeadErrors] = useState({});
  const [sent, setSent] = useState(null);

  const quote = useMemo(() => estimate({ ...q, age: Math.min(Math.max(q.age || 18, 18), 80) }), [q]);

  const chooseQuote = (name) => {
    setPlan(name);
    setSent(null);
    quoteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submitLead = (e) => {
    e.preventDefault();
    const er = {};
    if (lead.name.trim().length < 3) er.name = "Enter your name.";
    if (!/^[6-9]\d{9}$/.test(lead.mobile)) er.mobile = "Enter a valid 10-digit mobile number.";
    setLeadErrors(er);
    if (Object.keys(er).length) return;

    // Front-end only for now: see the note below the code.
    setSent("HI" + Date.now().toString().slice(-8));
  };

  return (
    <div className="sa-page">
      {/* ---------- header ---------- */}
      <header className="sa-header">
        <Link to="/" className="sa-brand"><span className="sa-mark">M</span>Meridian Bank</Link>
        <nav>
          <a href="#plans">Plans</a>
          <a href="#benefits">Benefits</a>
          <a href="#coverage">Coverage</a>
          <a href="#faq">FAQs</a>
        </nav>
        <div className="sa-header-actions">
          <Link to="/netbanking" className="sa-login">Login</Link>
          <button type="button" className="sa-btn primary" onClick={() => chooseQuote(plan)}>Get a Quote</button>
        </div>
      </header>

      {/* ---------- hero + quote ---------- */}
      <section className="sa-hero">
        <div className="sa-wrap sa-hero-grid">
          <div>
            <p className="sa-crumbs"><Link to="/">Home</Link> › Insurance › Health &amp; Accident Cover</p>
            <h1>Health &amp; Accident Insurance</h1>
            <p className="sa-lead">
              Protect yourself and your family from hospital bills and the unexpected.
              Compare plans, see an indicative premium and talk to our team.
            </p>
            <div className="sa-hero-actions">
              <a href="#plans" className="sa-btn primary lg">Explore plans</a>
              <a href="#coverage" className="sa-btn ghost lg">What's covered</a>
            </div>
          </div>

          <div className="hi-quote" ref={quoteRef}>
            <h2>Check your indicative premium</h2>

            <div className="hi-row">
              <label>Plan
                <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                  {Object.values(PLANS).flat().map((p) => <option key={p.name}>{p.name}</option>)}
                </select>
              </label>
            </div>

            <div className="hi-row two">
              <label>Your age
                <input type="number" min="18" max="80" value={q.age}
                  onChange={(e) => setQ({ ...q, age: Number(e.target.value) })} />
              </label>
              <label>Members
                <select value={q.members} onChange={(e) => setQ({ ...q, members: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>

            <div className="hi-row">
              <label>Cover amount
                <select value={q.cover} onChange={(e) => setQ({ ...q, cover: Number(e.target.value) })}>
                  <option value={300000}>₹3 lakh</option>
                  <option value={500000}>₹5 lakh</option>
                  <option value={1000000}>₹10 lakh</option>
                  <option value={2500000}>₹25 lakh</option>
                  <option value={5000000}>₹50 lakh</option>
                  <option value={10000000}>₹1 crore</option>
                </select>
              </label>
            </div>

            <div className="hi-result">
              <small>Estimated premium</small>
              <strong>{inr(quote.yearly)} <span>/ year</span></strong>
              <em>about {inr(quote.monthly)} a month</em>
            </div>
            <p className="hi-note">Indicative only. The final premium depends on the insurer, health details and policy terms.</p>

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
          <h2>Choose a plan type</h2>
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
                <button type="button" className="sa-btn primary" onClick={() => chooseQuote(p.name)}>Get a Quote</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- benefits ---------- */}
      <section className="sa-section alt" id="benefits">
        <div className="sa-wrap">
          <h2>Why buy health insurance with us</h2>
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

      {/* ---------- coverage ---------- */}
      <section className="sa-section" id="coverage">
        <div className="sa-wrap sa-two">
          <div className="sa-panel">
            <h2>What's usually covered</h2>
            <ul className="sa-ticks">{COVERED.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
          <div className="sa-panel">
            <h2>What's usually not covered</h2>
            <ul className="sa-ticks hi-cross">{NOT_COVERED.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* ---------- steps ---------- */}
      <section className="sa-section alt">
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
      <section className="sa-section" id="faq">
        <div className="sa-wrap sa-narrow">
          <h2>Frequently asked questions</h2>
          {FAQS.map((f) => (
            <details className="sa-faq" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </section>

      <section className="sa-cta">
        <div className="sa-wrap">
          <h2>Protect what matters most</h2>
          <button type="button" className="sa-btn light lg" onClick={() => chooseQuote(plan)}>Get a Quote</button>
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