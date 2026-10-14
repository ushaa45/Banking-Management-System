import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // adjust path to where this file lives
import "./LoginMenu.css";

/* Main link plus optional small links shown underneath. Replace URLs/names as needed. */
export const loginMenu = [
    { title: "NetBanking", to: "/netbanking" },
    {
        title: "Prepaid / Forex Card",
        links: [{ label: "Know more", url: "https://v.hdfc.bank.in/assets/popuppages/Prepaid-card.html" }],
    },
    {
        title: "Loans Portal",
        links: [
            { label: "Know more", url: "https://www.hdfc.bank.in/loans" },
            { label: "MyLoans", url: "https://www.hdfc.bank.in/myloans" },
        ],
    },
    {
        title: "HDFC Limited",
        links: [
            { label: "Home Loans", url: "https://portal.hdfc.bank.in/login" },
            { label: "Fixed Deposits", url: "https://www.hdfc.bank.in/fixed-deposit" },
        ],
    },
    { title: "Xpressway", url: "https://applyonline.hdfc.bank.in/xpressway.html?icid=website_organic_loxw" },
    {
        title: "FASTag",
        links: [{ label: "Know more", url: "https://v.hdfc.bank.in/htdocs/common/fastag/index.html" }],
    },
    { title: "Merchant Standing Instructions", url: "https://merchantmandate.hdfc.bank.in/login" },
    {
        title: "Verified by Visa / Mastercard / RuPay",
        url: "https://netsafe.hdfc.bank.in/ACSWeb/enrolljsp/HDFCValidate.jsp",
    },
];

/**
 * Login button that opens the services list on the SAME page (no navigation).
 * Props:
 *  - label: button text (default "LOGIN")
 *  - buttonClassName: your own button class (e.g. "login-button"); defaults to the red style
 *  - items: override the menu data
 */
export default function LoginMenu({
    label = "LOGIN",
    buttonClassName = "lm-button",
    items = loginMenu,
    showLinks = true,
    showForm = false, // if true, will redirect to the page the user was on after login
}) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/app"; // default to dashboard if no previous page

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(form.username, form.password);
            setOpen(false);
            setForm({ username: "", password: "" });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    const external = { target: "_blank", rel: "noopener noreferrer" };

    return (
        <div
            className="lm"
            ref={ref}
        >
            <button
                type="button"
                className={buttonClassName}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                {label} <span className="lm-caret" aria-hidden="true">▾</span>
            </button>

            {open && (
                <div className="lm-panel">
                    {showForm && (
                        <form className="lm-form" onSubmit={handleSubmit}>
                            <h3 className="lm-form-title">Sign in</h3>
                            <label>
                                Username
                                <input name="username" value={form.username} onChange={handleChange}
                                    autoComplete="username" required autoFocus />
                            </label>
                            <label>
                                Password
                                <input type="password" name="password" value={form.password} onChange={handleChange}
                                    autoComplete="current-password" required />
                            </label>
                            {error && <p className="lm-error" role="alert">{error}</p>}
                            <button type="submit" className="lm-submit" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>
                    )}

                    {showLinks &&
                        items.map((item) => (
                            <div className="lm-item" key={item.title}>
                                {item.to ? (
                                    <Link className="lm-title" to={item.to} onClick={() => setOpen(false)}>
                                        {item.title}
                                    </Link>
                                ) : item.url ? (
                                    <a className="lm-title" href={item.url} {...external}>
                                        {item.title}
                                    </a>
                                ) : (
                                    <span className="lm-title">{item.title}</span>
                                )}
                                {item.links && (
                                    <div className="lm-links">
                                        {item.links.map((l) => (
                                            <a className="lm-link" key={l.label} href={l.url} {...external}>
                                                {l.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}