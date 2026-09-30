import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import "./App.css";

export default function App() {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.some((r) => ["SUPER_ADMIN", "BANK_ADMIN"].includes(r));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-dot" />
          <span className="brand">Meridian Bank</span>
        </div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/send-money">Send Money</NavLink>
          <NavLink to="/loans">Loans</NavLink>
          <NavLink to="/deposits">Deposits</NavLink>
          <NavLink to="/policies">Policies</NavLink>
          <NavLink to="/claims">Claims</NavLink>
          {isAdmin && <NavLink to="/admin/users">Users</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <span className="hint">{user?.username}</span>
          <button className="link-button" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}