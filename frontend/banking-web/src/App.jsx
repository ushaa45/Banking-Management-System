import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.some((r) => ["SUPER_ADMIN", "BANK_ADMIN"].includes(r));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };  

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-dot" />
          <span className="brand">Meridian Bank</span>
        </div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/app/customers">Customers</NavLink>
          <NavLink to="/app/accounts">Accounts</NavLink>
          <NavLink to="/app/send-money">Send Money</NavLink>
          <NavLink to="/app/loans">Loans</NavLink>
          <NavLink to="/app/deposits">Deposits</NavLink>
          <NavLink to="/app/policies">Policies</NavLink>
          <NavLink to="/app/claims">Claims</NavLink>
          {isAdmin && <NavLink to="/app/admin/users">Users</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <span className="hint">{user?.username}</span>
          <button type="button" className="link-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}