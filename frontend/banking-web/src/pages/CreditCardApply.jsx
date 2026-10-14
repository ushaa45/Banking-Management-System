import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./OpenAccount.css"; // shared layout/styles
import "./CreditCardApply.css";

/* Edit cards, fees and eligibility freely. Fees here are placeholders. */
const CARDS = [
  {
    id: "everyday",
    name: "Meridian Everyday",
    tag: "Cashback on daily spends",
    joining: "₹500",
    annual: "₹500",
    perks: ["Cashback on groceries and bills", "Fuel surcharge waiver", "Annual fee waiver on yearly spends"],
    gradient: "linear-gradient(135deg, #1f6fbf, #123a78)",
  },
  {
    id: "travel",
    name: "Meridian Travel",
    tag: "Rewards on flights and hotels",
    joining: "₹2,500",
    annual: "₹2,500",
    perks: ["Reward points on travel bookings", "Complimentary lounge visits", "Low forex mark-up"],
    gradient: "linear-gradient(135deg, #7b2ff7, #3b1f8a)",
  },
  {
    id: "premier",
    name: "Meridian Premier",
    tag: "Lifestyle privileges",
    joining: "₹5,000",
    annual: "₹5,000",
    perks: ["Accelerated rewards on dining", "Priority customer service", "Milestone benefits"],
    gradient: "linear-gradient(135deg, #14202e, #3a4552)",
  },
];

const EMPLOYMENT = ["Salaried", "Self-employed", "Business", "Professional"];
const MIN_INCOME = 15000; // monthly, adjust to your policy

const initial = {
  cardId: "everyday",
  fullName: "",
  mobile: "",
  email: "",
  dob: "",
  pan: "",
  pincode: "",
  employment: "Salaried",
  income: "",
  consent: false,
};

const STEPS = ["Choose card", "Your details", "Review"];

function validate(step, f) {
  const e = {};

  if (step === 1) {
    if (f.fullName.trim().length < 3) e.fullName = "Enter your full name as on PAN.";
    if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (!f.dob) e.dob = "Select your date of birth.";
    else {
      const age = (Date.now() - new Date(f.dob).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 21) e.dob = "You must be at least 21 years old to apply.";
      else if (age > 65) e.dob = "Applicants must be 65 or younger.";
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(f.pan)) e.pan = "Enter a valid PAN (e.g. ABCDE1234F).";
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = "Enter a valid 6-digit pincode.";
    const inc = Number(f.income);
    if (!inc) e.income = "Enter your monthly income.";
    else if (inc < MIN_INCOME) e.income = `Minimum monthly income is ₹${MIN_INCOME.toLocaleString("en-IN")}.`;
  }

  if (step === 2 && !f.consent) e.consent = "Please accept the terms to continue.";
  return e;
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div className={`oa-field ${error ? "has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p className="oa-error">{error}</p>}
    </div>
  );
}

function MiniCard({ card, small }) {
  return (
    <div className={`ca-visual ${small ? "small" : ""}`} style={{ background: card.gradient }} aria-hidden="true">
      <span className="ca-brand">MERIDIAN</span>
      <span className="ca-chip" />
      <span className="ca-num">•••• •••• •••• ••••</span>
    </div>
  );
}

export default function CreditCardApply() {
  const [params] = useSearchParams();
  const preset = CARDS.find((c) => c.id === params.get("card"))?.id;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...initial, cardId: preset || initial.cardId });
  const [errors, setErrors] = useState({});
  const [reference, setReference] = useState(null);

  const card = CARDS.find((c) => c.id === form.cardId);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "mobile" || name === "pincode" || name === "income") v = v.replace(/\D/g, "");
    if (name === "pan") v = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setForm((f) => ({ ...f, [name]: v }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const next = (e) => {
    e.preventDefault();
    const er = validate(step, form);
    setErrors(er);
    if (Object.keys(er).length) return;
    if (step < 2) return setStep(step + 1);

    // Front-end only for now: see the note below the code.
    setReference("CC" + Date.now().toString().slice(-9));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const maskedPan = form.pan ? form.pan.slice(0, 2) + "XXXXX" + form.pan.slice(7) : "";

  return (
    <div className="oa-page">
      <header className="oa-header">
        <Link to="/" className="oa-brand"><span className="oa-mark">M</span>Meridian Bank</Link>
        <Link to="/netbanking" className="oa-login">Existing customer? Login</Link>
      </header>

      <div className="oa-body">
        {/* ---------- left ---------- */}
        <aside className="oa-aside">
          <span className="oa-eyebrow">CREDIT CARDS</span>
          <h1>Apply for your Meridian credit card online</h1>
          <p>Choose a card, share a few details and apply in minutes.</p>

          <MiniCard card={card} />
          <h3 className="ca-selected-name">{card.name}</h3>

          <ul className="oa-benefits">
            {card.perks.map((p) => (
              <li key={p}><span>✓</span><div><strong>{p}</strong></div></li>
            ))}
          </ul>

          <div className="oa-docs">
            <strong>Keep handy</strong>
            <span>PAN card</span>
            <span>Mobile number</span>
            <span>Income details</span>
          </div>
        </aside>

        {/* ---------- right ---------- */}
        <main className="oa-card">
          {reference ? (
            <div className="oa-success" role="status">
              <div className="oa-tick">✓</div>
              <h2>Application received</h2>
              <p>
                Thank you, <strong>{form.fullName.split(" ")[0]}</strong>. Your <strong>{card.name}</strong> application
                is under review. We'll contact you on <strong>+91 {form.mobile}</strong>.
              </p>
              <div className="oa-ref"><small>Reference number</small><strong>{reference}</strong></div>
              <Link to="/" className="oa-btn primary">Back to home</Link>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <ol className="oa-steps" aria-label="Progress">
                {STEPS.map((s, i) => (
                  <li key={s} className={i === step ? "current" : i < step ? "done" : ""}>
                    <span>{i < step ? "✓" : i + 1}</span>{s}
                  </li>
                ))}
              </ol>

              {step === 0 && (
                <>
                  <h2>Choose your card</h2>
                  <div className="ca-grid" role="radiogroup" aria-label="Credit card">
                    {CARDS.map((c) => (
                      <label key={c.id} className={`ca-option ${form.cardId === c.id ? "selected" : ""}`}>
                        <input type="radio" name="cardId" value={c.id}
                          checked={form.cardId === c.id} onChange={handleChange} />
                        <MiniCard card={c} small />
                        <div>
                          <strong>{c.name}</strong>
                          <small>{c.tag}</small>
                          <em>Joining fee {c.joining} · Annual fee {c.annual}</em>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2>Tell us about yourself</h2>
                  <Field label="Full name (as on PAN)" htmlFor="cc-name" error={errors.fullName}>
                    <input id="cc-name" name="fullName" value={form.fullName}
                      onChange={handleChange} autoComplete="name" autoFocus />
                  </Field>
                  <div className="oa-two">
                    <Field label="Mobile number" htmlFor="cc-mobile" error={errors.mobile}>
                      <div className="oa-prefix">
                        <span>+91</span>
                        <input id="cc-mobile" name="mobile" inputMode="numeric" maxLength={10}
                          value={form.mobile} onChange={handleChange} />
                      </div>
                    </Field>
                    <Field label="Email" htmlFor="cc-email" error={errors.email}>
                      <input id="cc-email" name="email" type="email" value={form.email} onChange={handleChange} />
                    </Field>
                  </div>
                  <div className="oa-two">
                    <Field label="Date of birth" htmlFor="cc-dob" error={errors.dob}>
                      <input id="cc-dob" name="dob" type="date" value={form.dob}
                        onChange={handleChange} max={new Date().toISOString().slice(0, 10)} />
                    </Field>
                    <Field label="PAN" htmlFor="cc-pan" error={errors.pan}>
                      <input id="cc-pan" name="pan" maxLength={10} value={form.pan}
                        onChange={handleChange} placeholder="ABCDE1234F" />
                    </Field>
                  </div>
                  <div className="oa-two">
                    <Field label="Residential pincode" htmlFor="cc-pin" error={errors.pincode}>
                      <input id="cc-pin" name="pincode" inputMode="numeric" maxLength={6}
                        value={form.pincode} onChange={handleChange} />
                    </Field>
                    <Field label="Employment type" htmlFor="cc-emp">
                      <select id="cc-emp" name="employment" value={form.employment} onChange={handleChange}>
                        {EMPLOYMENT.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Monthly income (₹)" htmlFor="cc-inc" error={errors.income}>
                    <div className="oa-prefix">
                      <span>₹</span>
                      <input id="cc-inc" name="income" inputMode="numeric"
                        value={form.income ? Number(form.income).toLocaleString("en-IN") : ""}
                        onChange={(e) => handleChange({ target: { name: "income", value: e.target.value, type: "text" } })} />
                    </div>
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Review and submit</h2>
                  <dl className="oa-review">
                    <div><dt>Card</dt><dd>{card.name}</dd></div>
                    <div><dt>Name</dt><dd>{form.fullName}</dd></div>
                    <div><dt>Mobile</dt><dd>+91 {form.mobile}</dd></div>
                    <div><dt>Email</dt><dd>{form.email}</dd></div>
                    <div><dt>Date of birth</dt><dd>{form.dob}</dd></div>
                    <div><dt>PAN</dt><dd>{maskedPan}</dd></div>
                    <div><dt>Pincode</dt><dd>{form.pincode}</dd></div>
                    <div><dt>Employment</dt><dd>{form.employment}</dd></div>
                    <div><dt>Monthly income</dt><dd>₹{Number(form.income).toLocaleString("en-IN")}</dd></div>
                  </dl>

                  <label className={`oa-check ${errors.consent ? "has-error" : ""}`}>
                    <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
                    <span>
                      I confirm the details are correct, agree to the Terms and Conditions and authorise
                      Meridian Bank to check my credit information for this application.
                    </span>
                  </label>
                  {errors.consent && <p className="oa-error">{errors.consent}</p>}
                </>
              )}

              <div className="oa-actions">
                {step > 0 && <button type="button" className="oa-btn ghost" onClick={back}>Back</button>}
                <button type="submit" className="oa-btn primary">
                  {step === 2 ? "Submit application" : "Continue"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}