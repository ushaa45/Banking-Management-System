
import { useState } from "react";
import "./GoldLoan.css";

export default function GoldLoan() {
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setMessage(
      "Demo only: this page is not connected to a bank or application system."
    );
  }

  return (
    <main className="express-page">
      <header className="express-header">
        <div className="express-logo">
          <span className="express-logo-mark">G</span>
          <span>Gold Loan Portal</span>
        </div>
        <span className="express-header-label">APPLICATION DEMO</span>
      </header>

      <section className="express-content">
        <div className="express-intro">
          <span className="express-eyebrow">YOUR APPLICATION, SIMPLIFIED</span>
          <h1>Welcome back.</h1>
          <p>
            Continue exploring your application journey from one
            convenient place.
          </p>

          <div className="express-benefits">
            <div className="express-benefit">
              <span className="express-check">✓</span>
              <div>
                <strong>Simple and convenient</strong>
                <p>A clean, guided application experience.</p>
              </div>
            </div>
            <div className="express-benefit">
              <span className="express-check">✓</span>
              <div>
                <strong>Track your progress</strong>
                <p>Designed to help you stay organized.</p>
              </div>
            </div>
            <div className="express-benefit">
              <span className="express-check">✓</span>
              <div>
                <strong>Built for you</strong>
                <p>Responsive on desktop, tablet, and mobile.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="express-card">
          <div className="express-card-icon">↗</div>
          <h2>Continue your journey</h2>
          <p className="express-card-subtitle">
            Enter a sample reference to preview the demo.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="demo-reference">Application reference</label>
            <input
              id="demo-reference"
              type="text"
              placeholder="e.g. DEMO-12345"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                setMessage("");
              }}
              required
            />

            <button type="submit">Continue to demo <span>→</span></button>
          </form>

          {message && (
            <p className="express-message" role="status">{message}</p>
          )}

          <div className="express-demo-notice">
            <strong>Demo environment</strong>
            <p>
              Do not enter real banking details, passwords, or OTPs.
              No information is sent to a bank.
            </p>
          </div>

          <p className="express-secure-note">
            <span>ⓘ</span> Demonstration interface — not an official bank portal
          </p>
        </div>
      </section>

      <footer className="express-footer">
        <span>Express Portal · UI Demo</span>
        <span>For development and testing only</span>
      </footer>
    </main>
  );
}
