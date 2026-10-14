import { useState } from "react";
import { Link } from "react-router-dom";
import "./OpenAccount.css";

const STEPS = ["Contact", "Personal details", "Review"];

const OCCUPATIONS = ["Salaried", "Self-employed", "Business", "Student", "Homemaker", "Retired"];

const initial = {
  fullName: "",
  mobile: "",
  email: "",
  dob: "",
  pan: "",
  pincode: "",
  occupation: "Salaried",
  consent: false,
};

function validate(step, f) {
  const e = {};

  if (step === 0) {
    if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
  }

  if (step === 1) {
    if (f.fullName.trim().length < 3) e.fullName = "Enter your full name as on PAN.";
    if (!f.dob) e.dob = "Select your date of birth.";
    else {
      const age = (Date.now() - new Date(f.dob).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) e.dob = "You must be at least 18 years old.";
      if (age > 100) e.dob = "Enter a valid date of birth.";
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(f.pan)) e.pan = "Enter a valid PAN (e.g. ABCDE1234F).";
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = "Enter a valid 6-digit pincode.";
  }

  if (step === 2 && !f.consent) e.consent = "Please accept the terms to continue.";

  return e;
}

function Field({ label, error, children, htmlFor }) {
  return (
    <div className={`oa-field ${error ? "has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p className="oa-error">{error}</p>}
    </div>
  );
}

export default function OpenAccount() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [reference, setReference] = useState(null);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "mobile" || name === "pincode") v = v.replace(/\D/g, "");
    if (name === "pan") v = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    set(name, v);
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const next = (e) => {
    e.preventDefault();
    const er = validate(step, form);
    setErrors(er);
    if (Object.keys(er).length) return;

    if (step < 2) return setStep(step + 1);

    // Final step. NOTE: front-end only for now. See the note below the code on connecting it to your backend.
    setReference("MB" + Date.now().toString().slice(-9));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const maskedPan = form.pan ? form.pan.slice(0, 2) + "XXXXX" + form.pan.slice(7) : "";

  return (
    <div className="oa-page">
      <header className="oa-header">
        <Link to="/" className="oa-brand">
          <span className="oa-mark">M</span>
          Meridian Bank
        </Link>
        <Link to="/netbanking" className="oa-login">Existing customer? Login</Link>
      </header>

      <div className="oa-body">
        {/* ---------- left: product info ---------- */}
        <aside className="oa-aside">
          <span className="oa-eyebrow">SAVINGS ACCOUNT</span>
          <h1>Open your Instant Savings Account online</h1>
          <p>Get started in minutes from your phone or laptop. No branch visit for the first step.</p>

          <ul className="oa-benefits">
            <li><span>✓</span><div><strong>Quick and paperless</strong><small>Fill in a short form with your PAN details.</small></div></li>
            <li><span>✓</span><div><strong>Everyday banking</strong><small>NetBanking, transfers and bill payments included.</small></div></li>
            <li><span>✓</span><div><strong>Secure by design</strong><small>Your data is only used to set up your account.</small></div></li>
          </ul>

          <div className="oa-docs">
            <strong>Keep handy</strong>
            <span>PAN card</span>
            <span>Mobile number</span>
            <span>Email address</span>
          </div>
        </aside>

        {/* ---------- right: application ---------- */}
        <main className="oa-card">
          {reference ? (
            <div className="oa-success" role="status">
              <div className="oa-tick">✓</div>
              <h2>Application received</h2>
              <p>Thank you, <strong>{form.fullName.split(" ")[0]}</strong>. We'll contact you on <strong>+91 {form.mobile}</strong> to complete verification.</p>
              <div className="oa-ref">
                <small>Reference number</small>
                <strong>{reference}</strong>
              </div>
              <Link to="/" className="oa-btn primary">Back to home</Link>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <ol className="oa-steps" aria-label="Progress">
                {STEPS.map((s, i) => (
                  <li key={s} className={i === step ? "current" : i < step ? "done" : ""}>
                    <span>{i < step ? "✓" : i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>

              {step === 0 && (
                <>
                  <h2>Let's start with your contact details</h2>
                  <Field label="Mobile number" htmlFor="oa-mobile" error={errors.mobile}>
                    <div className="oa-prefix">
                      <span>+91</span>
                      <input id="oa-mobile" name="mobile" inputMode="numeric" maxLength={10}
                        value={form.mobile} onChange={handleChange} autoComplete="tel-national" autoFocus />
                    </div>
                  </Field>
                  <Field label="Email address" htmlFor="oa-email" error={errors.email}>
                    <input id="oa-email" name="email" type="email" value={form.email}
                      onChange={handleChange} autoComplete="email" />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <h2>Tell us about yourself</h2>
                  <Field label="Full name (as on PAN)" htmlFor="oa-name" error={errors.fullName}>
                    <input id="oa-name" name="fullName" value={form.fullName}
                      onChange={handleChange} autoComplete="name" autoFocus />
                  </Field>
                  <div className="oa-two">
                    <Field label="Date of birth" htmlFor="oa-dob" error={errors.dob}>
                      <input id="oa-dob" name="dob" type="date" value={form.dob}
                        onChange={handleChange} max={new Date().toISOString().slice(0, 10)} />
                    </Field>
                    <Field label="PAN" htmlFor="oa-pan" error={errors.pan}>
                      <input id="oa-pan" name="pan" maxLength={10} value={form.pan}
                        onChange={handleChange} placeholder="ABCDE1234F" />
                    </Field>
                  </div>
                  <div className="oa-two">
                    <Field label="Residential pincode" htmlFor="oa-pin" error={errors.pincode}>
                      <input id="oa-pin" name="pincode" inputMode="numeric" maxLength={6}
                        value={form.pincode} onChange={handleChange} autoComplete="postal-code" />
                    </Field>
                    <Field label="Occupation" htmlFor="oa-occ">
                      <select id="oa-occ" name="occupation" value={form.occupation} onChange={handleChange}>
                        {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Review and submit</h2>
                  <dl className="oa-review">
                    <div><dt>Name</dt><dd>{form.fullName}</dd></div>
                    <div><dt>Mobile</dt><dd>+91 {form.mobile}</dd></div>
                    <div><dt>Email</dt><dd>{form.email}</dd></div>
                    <div><dt>Date of birth</dt><dd>{form.dob}</dd></div>
                    <div><dt>PAN</dt><dd>{maskedPan}</dd></div>
                    <div><dt>Pincode</dt><dd>{form.pincode}</dd></div>
                    <div><dt>Occupation</dt><dd>{form.occupation}</dd></div>
                  </dl>

                  <label className={`oa-check ${errors.consent ? "has-error" : ""}`}>
                    <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
                    <span>
                      I confirm the details above are correct and agree to the Terms and Conditions
                      and to Meridian Bank contacting me about this application.
                    </span>
                  </label>
                  {errors.consent && <p className="oa-error">{errors.consent}</p>}
                </>
              )}

              <div className="oa-actions">
                {step > 0 && (
                  <button type="button" className="oa-btn ghost" onClick={back}>Back</button>
                )}
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