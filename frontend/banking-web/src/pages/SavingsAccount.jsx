import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SavingsAccount.css";

/* Edit all content freely. */
const CATEGORIES = {
  Popular: [
    { name: "Everyday Savings", tag: "A simple account for daily banking", points: ["Low minimum balance", "Free debit card", "NetBanking included"] },
    { name: "Smart Savings", tag: "Rewards on everyday spends", points: ["Cashback on card spends", "Higher transaction limits", "Free monthly statements"] },
    { name: "Digital Youth", tag: "Designed for first-time earners", points: ["Zero paperwork start", "Instant virtual card", "Spend insights in the app"] },
  ],
  Premium: [
    { name: "Premier Savings", tag: "For those who expect more", points: ["Dedicated relationship manager", "Preferential loan rates", "Priority service"] },
    { name: "Premier Plus", tag: "Banking with added privileges", points: ["Lounge access on select cards", "Higher cash limits", "Locker offers"] },
  ],
  "Senior Citizen": [
    { name: "Senior Savings", tag: "Banking comfort for your golden years", points: ["Doorstep services on request", "Pension credit support", "Priority at branches"] },
  ],
  Women: [
    { name: "Women's Savings", tag: "Curated for the women of today", points: ["Special card offers", "Health and wellness benefits", "Preferential loan pricing"] },
  ],
  Kids: [
    { name: "Kids Savings", tag: "Start the saving habit early", points: ["Operated with a guardian", "Spending limits", "Savings goals"] },
  ],
};

const BENEFITS = [
  { icon: "⚡", title: "Quick to open", text: "Fill a short form online and start in minutes." },
  { icon: "💳", title: "Debit card", text: "Spend online and in stores, with limits you control." },
  { icon: "📱", title: "24×7 digital banking", text: "Transfer money, pay bills and track spends anytime." },
  { icon: "🔒", title: "Secure by design", text: "Password-protected access and instant card controls." },
  { icon: "📈", title: "Interest on savings", text: "Earn interest on your balance, credited regularly." },
  { icon: "🏦", title: "Grow with us", text: "Add deposits, loans and insurance from the same login." },
];

const DOCS = ["PAN card", "Proof of address (Aadhaar, passport, voter ID or driving licence)", "Recent passport-size photograph", "Mobile number and email address"];
const ELIGIBILITY = ["Resident individual aged 18 or above", "Valid PAN and address proof", "Mobile number for verification", "Minors can open a Kids account through a guardian"];

const STEPS = [
  { n: 1, title: "Share your details", text: "Enter your mobile number, email and basic personal details." },
  { n: 2, title: "Verify and review", text: "Check your information and accept the terms." },
  { n: 3, title: "Start banking", text: "Once approved, sign in to NetBanking and start using your account." },
];

const HELP = ["Add / Modify Nominee", "Change Mobile Number", "Apply for Cheque Book", "Update PAN", "Update Email ID", "Account Transfer", "Update KYC"];

const FAQS = [
  { q: "What is a savings account?", a: "A savings account is a deposit account where you keep money safely, earn interest on your balance and make everyday payments and transfers." },
  { q: "Who can open a savings account?", a: "Resident individuals aged 18 or above with valid identity and address proof can open an account. Minors can open a Kids account with a guardian." },
  { q: "Do I need to visit a branch?", a: "You can start the application online. Depending on verification, we may contact you to complete any remaining steps." },
  { q: "Is there a minimum balance?", a: "Requirements depend on the account variant. Check the variant's details, or contact us before applying." },
  { q: "How do I access my account after it opens?", a: "Sign in to NetBanking with your Customer ID and password to view balances, transfer money and manage your card." },
];

export default function SavingsAccount() {
  const navigate = useNavigate();
  const tabs = Object.keys(CATEGORIES);
  const [tab, setTab] = useState("Popular");

  const open = () => navigate("/open-accounts");

  return (
    <div className="sa-page">
      {/* ---------- header ---------- */}
      <header className="sa-header">
        <Link to="/" className="sa-brand"><span className="sa-mark">M</span>Meridian Bank</Link>
        <nav>
          <a href="#variants">Account types</a>
          <a href="#benefits">Benefits</a>
          <a href="#eligibility">Eligibility</a>
          <a href="#faq">FAQs</a>
        </nav>
        <div className="sa-header-actions">
          <Link to="/netbanking" className="sa-login">Login</Link>
          <button type="button" className="sa-btn primary" onClick={open}>Open Now</button>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="sa-hero">
        <div className="sa-wrap sa-hero-grid">
          <div>
            <p className="sa-crumbs"><Link to="/">Home</Link> › Accounts › Savings Account</p>
            <h1>Savings Account</h1>
            <p className="sa-lead">
              Open a savings account online and manage your money from one place,
              with a debit card, NetBanking and tools to help you save.
            </p>
            <div className="sa-hero-actions">
              <button type="button" className="sa-btn primary lg" onClick={open}>Open Now</button>
              <a href="#variants" className="sa-btn ghost lg">Compare accounts</a>
            </div>
          </div>

          <div className="sa-hero-card" aria-hidden="true">
            <div className="sa-stat"><strong>5 min</strong><span>to start your application</span></div>
            <div className="sa-stat"><strong>24×7</strong><span>digital banking access</span></div>
            <div className="sa-stat"><strong>1 login</strong><span>for accounts, loans and more</span></div>
          </div>
        </div>
      </section>

      {/* ---------- variants ---------- */}
      <section className="sa-section" id="variants">
        <div className="sa-wrap">
          <h2>Choose the account that fits you</h2>
          <p className="sa-sub">Pick a category to see the savings accounts available.</p>

          <div className="sa-tabs" role="tablist">
            {tabs.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t}
                className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t} <span>{CATEGORIES[t].length}</span>
              </button>
            ))}
          </div>

          <div className="sa-cards">
            {CATEGORIES[tab].map((v) => (
              <article className="sa-card" key={v.name}>
                <h3>{v.name}</h3>
                <p className="sa-tag">{v.tag}</p>
                <ul>{v.points.map((p) => <li key={p}>{p}</li>)}</ul>
                <button type="button" className="sa-btn primary" onClick={open}>Open Now</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- benefits ---------- */}
      <section className="sa-section alt" id="benefits">
        <div className="sa-wrap">
          <h2>Why open a savings account with us</h2>
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

      {/* ---------- eligibility ---------- */}
      <section className="sa-section" id="eligibility">
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
      <section className="sa-section alt">
        <div className="sa-wrap">
          <h2>How to open your account</h2>
          <ol className="sa-steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="sa-center">
            <button type="button" className="sa-btn primary lg" onClick={open}>Open Now</button>
          </div>
        </div>
      </section>

      {/* ---------- need help ---------- */}
      <section className="sa-section">
        <div className="sa-wrap">
          <h2>Need help with your account?</h2>
          <p className="sa-sub">Sign in to NetBanking to manage these.</p>
          <div className="sa-chips">
            {HELP.map((h) => <Link key={h} to="/netbanking" className="sa-chip">{h} ›</Link>)}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="sa-section alt" id="faq">
        <div className="sa-wrap sa-narrow">
          <h2>Frequently asked questions</h2>
          {FAQS.map((f) => (
            <details className="sa-faq" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- cta + footer ---------- */}
      <section className="sa-cta">
        <div className="sa-wrap">
          <h2>Ready to start saving?</h2>
          <button type="button" className="sa-btn light lg" onClick={open}>Open Now</button>
        </div>
      </section>

      <footer className="sa-footer">
        <div className="sa-wrap">
          <span>© {new Date().getFullYear()} Meridian Bank</span>
          <span>Terms and conditions apply. Features vary by account variant.</span>
        </div>
      </footer>
    </div>
  );
}