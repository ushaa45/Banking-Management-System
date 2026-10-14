
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PersonalLoan.css";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const features = [
  {
    icon: "⚡",
    title: "Quick Application",
    text: "Complete your application through a simple digital journey.",
  },
  {
    icon: "₹",
    title: "Flexible Loan Amount",
    text: "Explore loan amounts according to your needs and eligibility.",
  },
  {
    icon: "📅",
    title: "Flexible Repayment",
    text: "Estimate monthly instalments for different repayment periods.",
  },
  {
    icon: "🔒",
    title: "Secure Process",
    text: "Keep your personal information protected throughout the process.",
  },
];

const faqs = [
  {
    q: "What can I use a personal loan for?",
    a: "Personal loans may help cover expenses such as medical bills, travel, education, weddings, or home improvements, subject to the lender's terms.",
  },
  {
    q: "How is my EMI calculated?",
    a: "Your EMI depends on the loan amount, interest rate, and repayment tenure. Use the calculator above to estimate your monthly payment.",
  },
  {
    q: "What documents may be required?",
    a: "Depending on your profile and lender requirements, you may need identity, address, income, and employment documents.",
  },
  {
    q: "Does submitting an application guarantee approval?",
    a: "No. Approval and the final offer depend on eligibility checks, credit assessment, verification, and the lender's policies.",
  },
];

export default function PersonalLoan() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(3);
  const [openFaq, setOpenFaq] = useState(0);

  const [applicant, setApplicant] = useState({
    fullName: "",
    mobile: "",
    income: "",
    employment: "Salaried",
  });

  const principal = Number(amount);
  const monthlyRate = Number(rate) / 1200;
  const months = Number(years) * 12;

  const emi = monthlyRate > 0
    ? principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  const startApplication = () => {
    document.getElementById("loan-application")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const submitApplication = (e) => {
    e.preventDefault();

    // Demo only: connect your own secure backend here.
    navigate("/app/loans", {
      state: {
        product: "Personal Loan",
        applicant,
        requestedAmount: principal,
      },
    });
  };

  return (
    <main className="pl-page">
      <div className="pl-breadcrumb">
        <span>Home</span> / <span>Loans</span> / <strong>Personal Loan</strong>
      </div>

      <section className="pl-hero">
        <div className="pl-hero-copy">
          <span className="pl-eyebrow">PERSONAL LOANS</span>
          <h1>Make your plans happen, one step at a time.</h1>
          <p>
            From life's unexpected expenses to your next big milestone,
            explore flexible personal loan options for your needs.
          </p>

          <div className="pl-hero-actions">
            <button className="pl-primary" onClick={startApplication}>
              Get Started <span>→</span>
            </button>
            <button
              className="pl-secondary"
              onClick={() =>
                document.getElementById("pl-calculator")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Calculate EMI
            </button>
          </div>

          <div className="pl-trust">
            <span>✓ Digital application</span>
            <span>✓ Clear repayment estimates</span>
          </div>
        </div>

        <div className="pl-hero-visual" aria-hidden="true">
          <div className="pl-orbit pl-orbit-one" />
          <div className="pl-orbit pl-orbit-two" />
          <div className="pl-money-card">
            <span className="pl-money-icon">₹</span>
            <span>YOUR NEXT MILESTONE</span>
            <strong>Dream it. Plan it.</strong>
            <div className="pl-money-bars">
              <i /><i /><i /><i /><i />
            </div>
            <small>Plan your finances with confidence</small>
          </div>
          <div className="pl-floating-icon">↗</div>
        </div>
      </section>

      <section className="pl-features">
        <div className="pl-heading">
          <span className="pl-eyebrow">SIMPLE. FLEXIBLE. DIGITAL.</span>
          <h2>A personal loan designed around your needs</h2>
          <p>Explore the features and estimate a repayment plan that works for you.</p>
        </div>

        <div className="pl-feature-grid">
          {features.map((feature) => (
            <article className="pl-feature" key={feature.title}>
              <div className="pl-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pl-calculator" id="pl-calculator">
        <div className="pl-calculator-copy">
          <span className="pl-eyebrow">PLAN YOUR REPAYMENTS</span>
          <h2>Personal Loan EMI Calculator</h2>
          <p>
            Adjust the loan amount, interest rate, and tenure to estimate
            your monthly instalment.
          </p>

          <div className="pl-field">
            <div className="pl-field-heading">
              <label htmlFor="pl-amount">Loan amount</label>
              <strong>{money(principal)}</strong>
            </div>
            <input
              id="pl-amount"
              type="range"
              min="25000"
              max="5000000"
              step="25000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div className="pl-range-labels">
              <span>₹25,000</span><span>₹50 lakh</span>
            </div>
          </div>

          <div className="pl-field">
            <div className="pl-field-heading">
              <label htmlFor="pl-rate">Annual interest rate</label>
              <strong>{rate.toFixed(1)}%</strong>
            </div>
            <input
              id="pl-rate"
              type="range"
              min="6"
              max="30"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <div className="pl-range-labels">
              <span>6%</span><span>30%</span>
            </div>
          </div>

          <div className="pl-field">
            <div className="pl-field-heading">
              <label htmlFor="pl-tenure">Repayment tenure</label>
              <strong>{years} {years === 1 ? "year" : "years"}</strong>
            </div>
            <input
              id="pl-tenure"
              type="range"
              min="1"
              max="6"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
            <div className="pl-range-labels">
              <span>1 year</span><span>6 years</span>
            </div>
          </div>
        </div>

        <div className="pl-result">
          <span className="pl-result-label">YOUR ESTIMATED MONTHLY EMI</span>
          <div className="pl-emi">{money(emi)}</div>
          <div className="pl-result-divider" />

          <div className="pl-result-row">
            <span>Loan amount</span><strong>{money(principal)}</strong>
          </div>
          <div className="pl-result-row">
            <span>Total interest</span><strong>{money(totalInterest)}</strong>
          </div>
          <div className="pl-result-row">
            <span>Total repayment</span><strong>{money(totalPayment)}</strong>
          </div>

          <div className="pl-payment-bar">
            <div
              className="pl-payment-principal"
              style={{
                width: `${(principal / totalPayment) * 100}%`,
              }}
            />
          </div>
          <div className="pl-legend">
            <span><i className="pl-dot-blue" /> Principal</span>
            <span><i className="pl-dot-light" /> Interest</span>
          </div>

          <button className="pl-primary pl-full" onClick={startApplication}>
            Explore Application <span>→</span>
          </button>
          <small className="pl-result-note">
            Illustrative estimate only. Actual rates, fees, EMI and approval
            depend on the lender and your eligibility.
          </small>
        </div>
      </section>

      <section className="pl-application" id="loan-application">
        <div className="pl-heading">
          <span className="pl-eyebrow">TAKE THE NEXT STEP</span>
          <h2>Start your personal loan journey</h2>
          <p>Enter your details to continue to the demo application flow.</p>
        </div>

        <form className="pl-form" onSubmit={submitApplication}>
          <div className="pl-form-grid">
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={applicant.fullName}
                onChange={(e) =>
                  setApplicant({ ...applicant, fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Mobile number
              <input
                required
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                title="Enter a valid 10-digit Indian mobile number"
                value={applicant.mobile}
                onChange={(e) =>
                  setApplicant({
                    ...applicant,
                    mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                placeholder="10-digit mobile number"
              />
            </label>

            <label>
              Monthly income (₹)
              <input
                required
                type="number"
                min="1"
                value={applicant.income}
                onChange={(e) =>
                  setApplicant({ ...applicant, income: e.target.value })
                }
                placeholder="Enter monthly income"
              />
            </label>

            <label>
              Employment type
              <select
                value={applicant.employment}
                onChange={(e) =>
                  setApplicant({ ...applicant, employment: e.target.value })
                }
              >
                <option>Salaried</option>
                <option>Self-employed</option>
                <option>Business owner</option>
              </select>
            </label>
          </div>

          <p className="pl-form-notice">
            Demo only: these details are not submitted to a lender. Connect
            a secure backend before using this form with real customer data.
          </p>

          <button className="pl-primary" type="submit">
            Continue <span>→</span>
          </button>
        </form>
      </section>

      <section className="pl-faq">
        <div className="pl-heading">
          <span className="pl-eyebrow">HELP & SUPPORT</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="pl-faq-list">
          {faqs.map((faq, i) => (
            <article className="pl-faq-item" key={faq.q}>
              <button
                type="button"
                aria-expanded={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              >
                {faq.q}
                <span>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <p>{faq.a}</p>}
            </article>
          ))}
        </div>
      </section>

      <footer className="pl-disclaimer">
        <strong>Important information</strong>
        <p>
          This is a demonstration page for a banking application, not an
          official lender website or loan offer. Calculator results are
          estimates and exclude applicable fees and charges. Loan approval
          is subject to lender assessment and terms.
        </p>
      </footer>
    </main>
  );
}
