import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./OpenAccount.css";            // shared layout/styles
import "./CurrentAccountApply.css";

/* Edit variants and balances freely. Figures here are placeholders. */
const VARIANTS = [
  { id: "regular", name: "Regular Current", tag: "For small and growing businesses", balance: "₹10,000", perks: ["Unlimited deposits at home branch", "NetBanking and mobile access", "Cheque book and statements"] },
  { id: "plus", name: "Plus Current", tag: "Higher limits for active accounts", balance: "₹50,000", perks: ["Higher free cash handling limit", "Multi-city cheque access", "Priority service"] },
  { id: "premium", name: "Premium Current", tag: "For large business turnover", balance: "₹2,00,000", perks: ["Dedicated relationship manager", "Bulk payment support", "Trade and forex assistance"] },
];

const CONSTITUTION = ["Proprietorship", "Partnership", "Private Limited", "LLP", "Public Limited", "Trust / Society"];
const TURNOVER = ["Below ₹10 lakh", "₹10 – 50 lakh", "₹50 lakh – 1 crore", "₹1 – 5 crore", "Above ₹5 crore"];
const STEPS = ["Account type", "Business details", "Review"];

const initial = {
  variant: "regular",
  businessName: "",
  constitution: "Proprietorship",
  businessPan: "",
  gstin: "",
  turnover: TURNOVER[0],
  contactName: "",
  mobile: "",
  email: "",
  pincode: "",
  consent: false,
};

function validate(step, f) {
  const e = {};

  if (step === 1) {
    if (f.businessName.trim().length < 3) e.businessName = "Enter your business name.";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(f.businessPan)) e.businessPan = "Enter a valid PAN (e.g. ABCDE1234F).";
    if (f.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(f.gstin))
      e.gstin = "Enter a valid 15-character GSTIN, or leave it blank.";
    if (f.contactName.trim().length < 3) e.contactName = "Enter the contact person's name.";
    if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = "Enter a valid 6-digit pincode.";
  }

  if (step === 2 && !f.consent) e.consent = "Please accept the terms to continue.";
  return e;
}

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className={`oa-field ${error ? "has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="cu-hint">{hint}</p>}
      {error && <p className="oa-error">{error}</p>}
    </div>
  );
}

export default function CurrentAccountApply() {
  const [params] = useSearchParams();
  const preset = VARIANTS.find((v) => v.id === params.get("variant"))?.id;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...initial, variant: preset || initial.variant });
  const [errors, setErrors] = useState({});
  const [reference, setReference] = useState(null);

  const variant = VARIANTS.find((v) => v.id === form.variant);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "mobile" || name === "pincode") v = v.replace(/\D/g, "");
    if (name === "businessPan" || name === "gstin") v = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
    setReference("CA" + Date.now().toString().slice(-9));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const maskedPan = form.businessPan ? form.businessPan.slice(0, 2) + "XXXXX" + form.businessPan.slice(7) : "";

  return (
    <div className="oa-page">
      <header className="oa-header">
        <Link to="/" className="oa-brand"><span className="oa-mark">M</span>Meridian Bank</Link>
        <Link to="/netbanking" className="oa-login">Existing customer? Login</Link>
      </header>

      <div className="oa-body">
        {/* ---------- left ---------- */}
        <aside className="oa-aside">
          <span className="oa-eyebrow">CURRENT ACCOUNT</span>
          <h1>Open a business current account online</h1>
          <p>Everyday business banking, from collections and payments to payroll and cash flow.</p>

          <ul className="oa-benefits">
            {variant.perks.map((p) => (
              <li key={p}><span>✓</span><div><strong>{p}</strong></div></li>
            ))}
          </ul>

          <div className="oa-docs">
            <strong>Keep handy</strong>
            <span>Business PAN</span>
            <span>GSTIN (if any)</span>
            <span>Address proof</span>
            <span>Identity proof</span>
          </div>
        </aside>

        {/* ---------- right ---------- */}
        <main className="oa-card">
          {reference ? (
            <div className="oa-success" role="status">
              <div className="oa-tick">✓</div>
              <h2>Application received</h2>
              <p>
                Thank you. Your <strong>{variant.name}</strong> application for <strong>{form.businessName}</strong> is
                under review. We'll contact <strong>{form.contactName.split(" ")[0]}</strong> on <strong>+91 {form.mobile}</strong>.
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
                  <h2>Choose your account type</h2>
                  <div className="cu-grid" role="radiogroup" aria-label="Current account type">
                    {VARIANTS.map((v) => (
                      <label key={v.id} className={`cu-option ${form.variant === v.id ? "selected" : ""}`}>
                        <input type="radio" name="variant" value={v.id}
                          checked={form.variant === v.id} onChange={handleChange} />
                        <div>
                          <strong>{v.name}</strong>
                          <small>{v.tag}</small>
                        </div>
                        <em>Avg. balance<br /><b>{v.balance}</b></em>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2>About your business</h2>
                  <Field label="Business name" htmlFor="cu-biz" error={errors.businessName}>
                    <input id="cu-biz" name="businessName" value={form.businessName}
                      onChange={handleChange} autoComplete="organization" autoFocus />
                  </Field>
                  <div className="oa-two">
                    <Field label="Constitution" htmlFor="cu-con">
                      <select id="cu-con" name="constitution" value={form.constitution} onChange={handleChange}>
                        {CONSTITUTION.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Annual turnover" htmlFor="cu-turn">
                      <select id="cu-turn" name="turnover" value={form.turnover} onChange={handleChange}>
                        {TURNOVER.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="oa-two">
                    <Field label="Business PAN" htmlFor="cu-pan" error={errors.businessPan}>
                      <input id="cu-pan" name="businessPan" maxLength={10} value={form.businessPan}
                        onChange={handleChange} placeholder="ABCDE1234F" />
                    </Field>
                    <Field label="GSTIN (optional)" htmlFor="cu-gst" error={errors.gstin}>
                      <input id="cu-gst" name="gstin" maxLength={15} value={form.gstin} onChange={handleChange} />
                    </Field>
                  </div>

                  <h3 className="cu-sub">Contact person</h3>
                  <Field label="Full name" htmlFor="cu-name" error={errors.contactName}>
                    <input id="cu-name" name="contactName" value={form.contactName}
                      onChange={handleChange} autoComplete="name" />
                  </Field>
                  <div className="oa-two">
                    <Field label="Mobile number" htmlFor="cu-mobile" error={errors.mobile}>
                      <div className="oa-prefix">
                        <span>+91</span>
                        <input id="cu-mobile" name="mobile" inputMode="numeric" maxLength={10}
                          value={form.mobile} onChange={handleChange} />
                      </div>
                    </Field>
                    <Field label="Email" htmlFor="cu-email" error={errors.email}>
                      <input id="cu-email" name="email" type="email" value={form.email} onChange={handleChange} />
                    </Field>
                  </div>
                  <Field label="Business pincode" htmlFor="cu-pin" error={errors.pincode}>
                    <input id="cu-pin" name="pincode" inputMode="numeric" maxLength={6}
                      value={form.pincode} onChange={handleChange} />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Review and submit</h2>
                  <dl className="oa-review">
                    <div><dt>Account</dt><dd>{variant.name}</dd></div>
                    <div><dt>Business</dt><dd>{form.businessName}</dd></div>
                    <div><dt>Constitution</dt><dd>{form.constitution}</dd></div>
                    <div><dt>Turnover</dt><dd>{form.turnover}</dd></div>
                    <div><dt>PAN</dt><dd>{maskedPan}</dd></div>
                    <div><dt>GSTIN</dt><dd>{form.gstin || "—"}</dd></div>
                    <div><dt>Contact</dt><dd>{form.contactName}</dd></div>
                    <div><dt>Mobile</dt><dd>+91 {form.mobile}</dd></div>
                    <div><dt>Email</dt><dd>{form.email}</dd></div>
                    <div><dt>Pincode</dt><dd>{form.pincode}</dd></div>
                  </dl>

                  <label className={`oa-check ${errors.consent ? "has-error" : ""}`}>
                    <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
                    <span>
                      I confirm the details are correct, I am authorised to apply on behalf of this business,
                      and I agree to the Terms and Conditions.
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