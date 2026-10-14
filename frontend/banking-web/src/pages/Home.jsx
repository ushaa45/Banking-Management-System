
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import { Bell } from "lucide-react";
import LoginMenu from "./LoginMenu";
import ProductShowcase from "../components/ProductShowcase";
import EMiCalculator from "../components/EmiCalculator";
const products = [
  {
    icon: "◫",
    title: "Bank Accounts",
    description: "View balances, manage accounts and review transactions.",
    action: "View Accounts",
    path: "/app/accounts",
  },
  {
    icon: "↗",
    title: "Send Money",
    description: "Explore a simple, convenient money-transfer journey.",
    action: "Transfer Money",
    path: "/app/send-money",
  },
  {
    icon: "▤",
    title: "Loans",
    description: "Explore loan options and track your applications.",
    action: "Explore Loans",
    path: "/app/loans",
  },
  {
    icon: "◷",
    title: "Deposits",
    description: "Explore savings and recurring deposit services.",
    action: "View Deposits",
    path: "/app/deposits",
  },
  {
    icon: "◇",
    title: "Insurance Policies",
    description: "View available policy and insurance services.",
    action: "Explore Policies",
    path: "/app/policies",
  },
  {
    icon: "✓",
    title: "Claims",
    description: "Access claim information and follow claim progress.",
    action: "View Claims",
    path: "/app/claims",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="meridian-home">
      <div className="utility-bar">
        <div className="home-container utility-inner">
          <span>Welcome to Meridian Bank</span>
          <div>
            <a href="#help">Help & Support</a>
            <a href="#security">Safe Banking</a>
            <a href="#about">About Us</a>
            <a href="#Notifications" className="notification-link">
              <span className="notification-icon">
                <Bell size={18} />
                <span className="notification-dot"></span>
              </span></a>
          </div>
        </div>
      </div>

      <header className="home-header">
        <div className="home-container nav-inner">
          <Link to="/" className="bank-brand">
            <span className="brand-mark">M</span>
            <span>
              <strong>Meridian Bank</strong>
              <small>Banking made simpler</small>
            </span>
          </Link>

          <nav className="main-nav">
            <a href="#products">Products</a>
            <a href="#digital-banking">Digital Banking</a>
            <a href="#help">Support</a>
          </nav>

          {/*<button
            className="login-button"
            onClick={() => navigate("/banking-services")}
          >
            Login <span aria-hidden="true">↗</span>
          </button>*/}
          <LoginMenu label="LOGIN" />
        </div>
      </header>

      <section className="hero-section">
        <div className="home-container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              YOUR MONEY. YOUR JOURNEY.
            </span>

            <h1>
              Banking that moves
              <span> with your life.</span>
            </h1>

            <p>
              A simpler way to manage your accounts, move money
              and explore financial services — all in one place.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => navigate("/login")}
              >
                Access Internet Banking <span>→</span>
              </button>

              <a href="#products" className="text-link">
                Explore our services ↓
              </a>
            </div>

            <div className="trust-line">
              <span className="trust-icon">✓</span>
              Designed for convenient, secure digital banking
            </div>
          </div>

          <div className="hero-art">
            <div className="decor-circle circle-one" />
            <div className="decor-circle circle-two" />

            <div className="hero-card">
              <div className="hero-card-top">
                <span className="mini-brand">M</span>
                <span>MERIDIAN BANK</span>
                <span className="card-dots">•••</span>
              </div>

              <div className="card-chip">▦</div>
              <div className="card-number">•••• &nbsp; •••• &nbsp; ••••</div>
              <div className="card-bottom">
                <div>
                  <small>YOUR MONEY</small>
                  <strong>YOUR WAY</strong>
                </div>
                <span className="card-symbol">M</span>
              </div>
            </div>

            <div className="floating-note note-top">
              <span className="note-icon">↗</span>
              <div>
                <strong>Easy transfers</strong>
                <small>Bank on your terms</small>
              </div>
            </div>

            <div className="floating-note note-bottom">
              <span className="note-icon">✓</span>
              <div>
                <strong>One banking hub</strong>
                <small>Your services in one place</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <ProductShowcase />
      </section>
      <section className="digital-section" id="digital-banking">
        <EMiCalculator />
      </section>
      <section>

      </section>

      <section className="digital-section" id="digital-banking">
        <div className="home-container digital-grid">
          <div className="digital-symbol" aria-hidden="true">
            <div className="symbol-ring">M</div>
            <div className="symbol-line" />
          </div>

          <div>
            <span className="eyebrow">BANKING BEYOND BRANCHES</span>
            <h2>Your banking, on your schedule.</h2>
            <p>
              Access your banking dashboard to manage your
              available services from one convenient place.
              Sign in to continue to your personalized banking area.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/login")}
            >
              Get started <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="security-section" id="security">
        <div className="home-container security-inner">
          <div className="security-icon">⌑</div>
          <div>
            <h3>Your security matters.</h3>
            <p>
              Always protect your password and never share
              one-time passwords. Use the official login page
              and sign out when finished.
            </p>
          </div>
          <a href="#help">Banking safety tips →</a>
        </div>
      </section>

      <footer className="home-footer" id="help">
        <div className="home-container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="bank-brand">
              <span className="brand-mark">M</span>
              <span>
                <strong>Meridian Bank</strong>
                <small>Banking made simpler</small>
              </span>
            </Link>
            <p>
              A banking management project built around
              convenient digital services.
            </p>
          </div>

          <div>
            <h4>Banking</h4>
            <a href="#products">Accounts</a>
            <a href="#products">Money transfers</a>
            <a href="#products">Loans & deposits</a>
          </div>

          <div>
            <h4>Support</h4>
            <a href="#help">Help centre</a>
            <a href="#security">Safe banking</a>
            <Link to="/login">Sign in</Link>
          </div>
        </div>

        <div className="home-container footer-bottom">
          <span>© {new Date().getFullYear()} Meridian Bank</span>
          <span>Digital banking experience</span>
        </div>
      </footer>
    </main>
  );
};

export default Home;
