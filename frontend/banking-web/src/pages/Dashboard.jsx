import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerApi } from "../api/api";
import { useAuth } from "../auth/AuthContext";

const MODULES = [
  { to: "/customers", title: "Customers", desc: "Look up profiles, open new accounts, and manage KYC status." },
  { to: "/send-money", title: "Send Money", desc: "Move funds between accounts with a double-entry ledger." },
  { to: "/loans", title: "Loans", desc: "Apply, approve, sanction, disburse, and track EMI schedules." },
  { to: "/deposits", title: "Deposits", desc: "Open fixed and recurring deposits against a customer account." },
  { to: "/policies", title: "Policies", desc: "Issue insurance policies and track premium collection." },
  { to: "/claims", title: "Claims", desc: "File, review, approve, and settle insurance claims." },
];

export default function Dashboard() {
  const {user} = useAuth();
  const [customerCount, setCustomerCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    CustomerApi.list()
      .then((res) => setCustomerCount(res.data.length))
      .catch(() => setError("Could not reach the backend API yet."));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Welcome back, {user?.username}</h2>
      </div>
      <p className="eyebrow-line">Here's what's available in the system today.</p>

      {error && <p className="hint error">{error} — start the backend on :8080.</p>}

      <div className="card-grid">
        <div className="stat-card">
          <span className="stat-label">Total customers</span>
          <span className="stat-value">{customerCount ?? "—"}</span>
        </div>
      </div>

      <h3>Jump to a module</h3>
      <div className="module-grid">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="module-card">
            <div className="module-card-title">{m.title}</div>
            <div className="module-card-desc">{m.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
