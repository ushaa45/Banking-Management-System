import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./NetBanking.css";

export default function NetBanking() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  const [tab, setTab] = useState("personal");
  const [step, setStep] = useState(1); // 1 = user ID, 2 = password
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nb-page">
      {/* ---------- Left: information panel ---------- */}
      <aside className="nb-aside">
        <Link to="/" className="nb-back">← Back to home</Link>

        <div className="nb-aside-body">
          <h2>
            Sign in to <br />
            Meridian NetBanking
          </h2>
          <p>Manage accounts, send money and track loans from one secure place.</p>

          <ol className="nb-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Enter your Customer ID</strong>
                <small>The user ID you registered with.</small>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Enter your password</strong>
                <small>Never share it or your one-time passwords.</small>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>You're in</strong>
                <small>Land on your personal dashboard.</small>
              </div>
            </li>
          </ol>
        </div>

        <div className="nb-aside-card" aria-hidden="true">
          <span className="nb-aside-mark">M</span>
          <span>MERIDIAN BANK</span>
          <span className="nb-aside-dots">•••• •••• ••••</span>
        </div>
      </aside>

      {/* ---------- Right: login ---------- */}
      <main className="nb-main">
        <div className="nb-panel">
          <div className="nb-logo">
            <span className="nb-logo-mark">M</span>
            <span>Meridian Bank</span>
          </div>

          <h1>Welcome to NetBanking</h1>

          <div className="nb-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "personal"}
              className={tab === "personal" ? "active" : ""}
              onClick={() => setTab("personal")}
            >
              Personal Banking
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "cards"}
              className={tab === "cards" ? "active" : ""}
              onClick={() => setTab("cards")}
            >
              Credit Cards / Loans Only
            </button>
          </div>

          <div className="nb-qr-card">
            <div className="nb-qr-icon" aria-hidden="true">▦</div>
            <div>
              <strong>
                Login without Password <em>SOON</em>
              </strong>
              <small>Scan with the Meridian app to sign in.</small>
            </div>
          </div>

          <div className="nb-or"><span>Or</span></div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <label htmlFor="nb-user">Customer ID / User ID</label>
                <input
                  id="nb-user"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  autoFocus
                />
                <a href="#help" className="nb-link">Get Customer ID</a>
              </>
            ) : (
              <>
                <div className="nb-user-row">
                  <span>
                    Signing in as <strong>{form.username}</strong>
                  </span>
                  <button
                    type="button"
                    className="nb-link-button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                  >
                    Change
                  </button>
                </div>

                <label htmlFor="nb-pass">Password</label>
                <div className="nb-pass">
                  <input
                    id="nb-pass"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="nb-link-button"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </>
            )}

            {error && <p className="nb-error" role="alert">{error}</p>}

            <button type="submit" className="nb-submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="nb-register">
            Not registered for NetBanking? <Link to="/register">Register Now</Link>
          </p>

          <div className="nb-security">
            <span className="nb-shield" aria-hidden="true">✓</span>
            <div>
              <span>Your security is our priority</span>
              <a href="#help">Know More</a>
            </div>
          </div>

          <p className="nb-legal">
            © {new Date().getFullYear()} Meridian Bank · Terms and Conditions · Privacy Policy
          </p>
        </div>
      </main>
    </div>
  );
}