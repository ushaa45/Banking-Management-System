
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CarLoan.css";

const steps = ["Your Profile", "Car Details", "Dealer Details", "Review"];

const initialData = {
  customerType: "New customer",
  employment: "Salaried",
  monthlyIncome: "50000",
  city: "",
  carType: "New car",
  carBudget: "1000000",
  loanAmount: "800000",
  tenure: "5",
  carBrand: "",
  dealerName: "",
  dealerCity: "",
};

export default function CarLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const monthlyRate = 0.10 / 12;
  const months = Number(data.tenure) * 12;
  const principal = Number(data.loanAmount) || 0;

  const emi = monthlyRate > 0 && months > 0
    ? principal * monthlyRate *
      Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1)
    : 0;

  const next = (e) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitted(true);
    }
  };

  const back = () => {
    if (submitted) {
      setSubmitted(false);
      return;
    }

    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <main className="cl-page">
        <div className="cl-success">
          <div className="cl-success-icon">✓</div>
          <span className="cl-eyebrow">DEMO APPLICATION</span>
          <h1>Your details are ready for review</h1>
          <p>
            This prototype has not submitted a loan application or
            checked eligibility with a lender.
          </p>

          <div className="cl-review-box">
            <div><span>Vehicle</span><strong>{data.carType}</strong></div>
            <div><span>Car budget</span><strong>{formatMoney(data.carBudget)}</strong></div>
            <div><span>Requested loan</span><strong>{formatMoney(data.loanAmount)}</strong></div>
            <div><span>Estimated EMI</span><strong>{formatMoney(emi)}/month</strong></div>
          </div>

          <button
            className="cl-primary"
            onClick={() => navigate("/app/loans")}
          >
            Go to Loans Dashboard →
          </button>
          <button className="cl-text-btn" onClick={back}>
            Edit details
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="cl-page">
      <header className="cl-header">
        <button
          className="cl-brand"
          onClick={() => navigate("/")}
          aria-label="Go to home"
        >
          <span className="cl-brand-mark">B</span>
          <span>Banking <strong>Solutions</strong></span>
        </button>
        <span className="cl-secure"><span>●</span> Secure application demo</span>
      </header>

      <div className="cl-layout">
        <aside className="cl-sidebar">
          <span className="cl-eyebrow">CAR FINANCE</span>
          <h1>Your next car starts here.</h1>
          <p>
            Explore a simple digital car-loan journey, from your
            profile to your vehicle details.
          </p>

          <div className="cl-car-art" aria-hidden="true">
            <div className="cl-car-sun" />
            <svg viewBox="0 0 340 150" role="img">
              <path
                d="M43 92 L59 57 Q65 44 84 42 L132 35 Q149 33 165 46 L202 77 L264 82 Q285 84 293 101 L302 119 L33 119 Z"
                fill="#0756a5"
              />
              <path
                d="M77 57 L132 46 Q145 45 157 55 L180 77 L66 77 Z"
                fill="#dceeff"
              />
              <path d="M164 54 L195 78 L188 78 L158 51 Z" fill="#b3d8fa" />
              <path d="M35 100 L53 100 L48 113 L33 113 Z" fill="#ffd58a" />
              <path d="M280 97 L294 103 L299 114 L282 114 Z" fill="#ffb4a6" />
              <circle cx="85" cy="117" r="23" fill="#142f4c" />
              <circle cx="85" cy="117" r="11" fill="#dce9f5" />
              <circle cx="253" cy="117" r="23" fill="#142f4c" />
              <circle cx="253" cy="117" r="11" fill="#dce9f5" />
              <path d="M43 92 L293 92" stroke="#347fc0" strokeWidth="2" />
            </svg>
            <div className="cl-car-caption">
              <span>PLAN YOUR PURCHASE</span>
              <strong>Drive your dreams.</strong>
            </div>
          </div>

          <div className="cl-side-benefit">
            <span>✓</span> Guided step-by-step experience
          </div>
          <div className="cl-side-benefit">
            <span>✓</span> Estimated repayment summary
          </div>
          <div className="cl-side-benefit">
            <span>✓</span> Review before completion
          </div>
        </aside>

        <section className="cl-main">
          <div className="cl-mobile-title">
            <span className="cl-eyebrow">DIGITAL CAR LOAN</span>
            <h1>Let's get you moving.</h1>
          </div>

          <div className="cl-step-top">
            <span>STEP {step + 1} OF {steps.length}</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
          </div>

          <div
            className="cl-progress"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
          >
            <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>

          <div className="cl-step-labels">
            {steps.map((label, i) => (
              <div
                key={label}
                className={i === step ? "current" : i < step ? "complete" : ""}
              >
                <span>{i < step ? "✓" : i + 1}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>

          <form onSubmit={next} className="cl-form">
            {step === 0 && (
              <>
                <span className="cl-eyebrow">LET'S START WITH YOU</span>
                <h2>Tell us about yourself</h2>
                <p className="cl-description">
                  Help us understand your basic borrowing requirements.
                </p>

                <fieldset className="cl-fieldset">
                  <legend>Are you an existing customer?</legend>
                  <div className="cl-choice-grid">
                    {["Existing customer", "New customer"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`cl-choice ${data.customerType === option ? "selected" : ""}`}
                        onClick={() => update("customerType", option)}
                      >
                        <span className="cl-choice-radio">
                          {data.customerType === option ? "●" : ""}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="cl-label">
                  Employment type
                  <select
                    value={data.employment}
                    onChange={(e) => update("employment", e.target.value)}
                  >
                    <option>Salaried</option>
                    <option>Self-employed</option>
                    <option>Business owner</option>
                  </select>
                </label>

                <label className="cl-label">
                  Monthly income (₹)
                  <input
                    type="number"
                    min="1"
                    required
                    value={data.monthlyIncome}
                    onChange={(e) => update("monthlyIncome", e.target.value)}
                  />
                </label>

                <label className="cl-label">
                  City of residence
                  <input
                    required
                    value={data.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Enter your city"
                  />
                </label>
              </>
            )}

            {step === 1 && (
              <>
                <span className="cl-eyebrow">YOUR DREAM CAR</span>
                <h2>Tell us about the vehicle</h2>
                <p className="cl-description">
                  Add an estimate of your vehicle budget and financing needs.
                </p>

                <fieldset className="cl-fieldset">
                  <legend>Vehicle type</legend>
                  <div className="cl-choice-grid">
                    {["New car", "Used car"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`cl-choice ${data.carType === option ? "selected" : ""}`}
                        onClick={() => update("carType", option)}
                      >
                        <span className="cl-choice-radio">
                          {data.carType === option ? "●" : ""}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="cl-label">
                  Estimated car budget (₹)
                  <input
                    type="number"
                    min="1"
                    required
                    value={data.carBudget}
                    onChange={(e) => {
                      update("carBudget", e.target.value);
                      if (Number(data.loanAmount) > Number(e.target.value)) {
                        update("loanAmount", e.target.value);
                      }
                    }}
                  />
                </label>

                <label className="cl-label">
                  Requested loan amount (₹)
                  <input
                    type="number"
                    min="1"
                    max={data.carBudget}
                    required
                    value={data.loanAmount}
                    onChange={(e) => update("loanAmount", e.target.value)}
                  />
                </label>

                <label className="cl-label">
                  Preferred repayment tenure
                  <select
                    value={data.tenure}
                    onChange={(e) => update("tenure", e.target.value)}
                  >
                    <option value="1">1 year</option>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="4">4 years</option>
                    <option value="5">5 years</option>
                    <option value="6">6 years</option>
                    <option value="7">7 years</option>
                  </select>
                </label>

                <div className="cl-emi-preview">
                  <span>Illustrative EMI at 10% annual interest</span>
                  <strong>{formatMoney(emi)} / month</strong>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <span className="cl-eyebrow">YOUR VEHICLE PARTNER</span>
                <h2>Dealer details</h2>
                <p className="cl-description">
                  Add the dealer information if you have selected a dealership.
                </p>

                <label className="cl-label">
                  Car brand
                  <input
                    required
                    value={data.carBrand}
                    onChange={(e) => update("carBrand", e.target.value)}
                    placeholder="e.g. Maruti Suzuki"
                  />
                </label>

                <label className="cl-label">
                  Dealer or showroom name
                  <input
                    required
                    value={data.dealerName}
                    onChange={(e) => update("dealerName", e.target.value)}
                    placeholder="Enter showroom name"
                  />
                </label>

                <label className="cl-label">
                  Dealer city
                  <input
                    required
                    value={data.dealerCity}
                    onChange={(e) => update("dealerCity", e.target.value)}
                    placeholder="Enter dealer city"
                  />
                </label>

                <div className="cl-info-note">
                  <span>ⓘ</span>
                  <p>
                    This demo doesn't verify dealerships or retrieve live
                    vehicle offers.
                  </p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <span className="cl-eyebrow">ALMOST THERE</span>
                <h2>Review your details</h2>
                <p className="cl-description">
                  Check the information before finishing this demo journey.
                </p>

                <div className="cl-review-box">
                  <div><span>Customer type</span><strong>{data.customerType}</strong></div>
                  <div><span>Employment</span><strong>{data.employment}</strong></div>
                  <div><span>Monthly income</span><strong>{formatMoney(data.monthlyIncome)}</strong></div>
                  <div><span>Residence</span><strong>{data.city}</strong></div>
                  <div><span>Vehicle</span><strong>{data.carType}</strong></div>
                  <div><span>Car brand</span><strong>{data.carBrand}</strong></div>
                  <div><span>Dealer</span><strong>{data.dealerName}</strong></div>
                  <div><span>Dealer city</span><strong>{data.dealerCity}</strong></div>
                  <div><span>Car budget</span><strong>{formatMoney(data.carBudget)}</strong></div>
                  <div><span>Requested loan</span><strong>{formatMoney(data.loanAmount)}</strong></div>
                  <div><span>Tenure</span><strong>{data.tenure} years</strong></div>
                  <div><span>Estimated EMI</span><strong>{formatMoney(emi)}/month</strong></div>
                </div>

                <div className="cl-info-note">
                  <span>ⓘ</span>
                  <p>
                    Completing this screen only finishes the local demo.
                    No loan request is sent and no eligibility decision is made.
                  </p>
                </div>
              </>
            )}

            <div className="cl-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="cl-back"
                  onClick={back}
                >
                  ← Back
                </button>
              )}
              <button className="cl-primary" type="submit">
                {step === steps.length - 1 ? "Finish Demo" : "Continue"} →
              </button>
            </div>
          </form>

          <p className="cl-privacy">
            Demo experience only. Do not enter bank passwords, OTPs,
            PAN, Aadhaar, or other sensitive identity information.
          </p>
        </section>
      </div>
    </main>
  );
}
