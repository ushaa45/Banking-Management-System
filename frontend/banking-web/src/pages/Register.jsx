import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi } from "../api/api";
import "./NetBanking.css";
import "./Register.css";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
const makeCode = (len = 6) =>
    Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

/* Draws the security code with some noise on a canvas */
function CaptchaImage({ code }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const { width, height } = canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // noise lines
        for (let i = 0; i < 6; i++) {
            ctx.strokeStyle = `rgba(20,32,46,${0.15 + Math.random() * 0.25})`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // characters
        const step = width / (code.length + 1);
        [...code].forEach((ch, i) => {
            ctx.save();
            ctx.translate(step * (i + 1), height / 2 + (Math.random() * 10 - 5));
            ctx.rotate((Math.random() - 0.5) * 0.6);
            ctx.font = `italic 700 ${30 + Math.random() * 6}px Georgia, serif`;
            ctx.fillStyle = "#14202e";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ch, 0, 0);
            ctx.restore();
        });
    }, [code]);

    return <canvas ref={ref} width={160} height={58} className="rg-canvas" aria-label="Security code" />;
}

export default function Register({ admin = false }) {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = customer ID + code, 2 = create password
    const [captcha, setCaptcha] = useState(makeCode);
    const [form, setForm] = useState({
        customerId: "",
        code: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const refreshCaptcha = useCallback(() => {
        setCaptcha(makeCode());
        setForm((f) => ({ ...f, code: "" }));
    }, []);

    const speakCaptcha = () => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance([...captcha].join(" "));
        u.rate = 0.7;
        window.speechSynthesis.speak(u);
    };

    /* Step 1: Customer ID + security code */
    const handleContinue = (e) => {
        e.preventDefault();
        setTouched(true);
        setError(null);

        if (!form.customerId.trim()) return;

        if (form.code.trim().toUpperCase() !== captcha) {
            setError("The security code you entered is incorrect.");
            refreshCaptcha();
            return;
        }
        setStep(2);
    };

    /* Step 2: create the login */
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                username: form.customerId.trim(),
                email: form.email.trim(),
                password: form.password,
            };
            if (admin) {
                payload.role = "CUSTOMER";
            }
            await (admin ? AuthApi.register(payload) : AuthApi.signup(payload));
            setSuccess(true);
            setTimeout(() => navigate(admin ? "/app/admin/users" : "/netbanking"), 1800);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const idMissing = touched && !form.customerId.trim();

    return (
        <div className="nb-page">
            {/* ---------- Left: info panel ---------- */}
            <aside className="nb-aside">
                <Link to="/" className="nb-back">← Back to home</Link>

                <div className="nb-aside-body">
                    <h2>
                        Register for <br />
                        Meridian NetBanking
                    </h2>
                    <p>Create your login to manage accounts, send money and track loans.</p>

                    <ol className="nb-steps">
                        <li>
                            <span>1</span>
                            <div>
                                <strong>Verify your Customer ID</strong>
                                <small>Enter your ID and the security code.</small>
                            </div>
                        </li>
                        <li>
                            <span>2</span>
                            <div>
                                <strong>Set a password</strong>
                                <small>At least 6 characters. Never share it.</small>
                            </div>
                        </li>
                        <li>
                            <span>3</span>
                            <div>
                                <strong>Sign in</strong>
                                <small>Continue to NetBanking with your new login.</small>
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

            {/* ---------- Right: form ---------- */}
            <main className="nb-main">
                <div className="nb-panel">
                    <div className="nb-logo">
                        <span className="nb-logo-mark">M</span>
                        <span>Meridian Bank</span>
                    </div>

                    <h1>Register for NetBanking</h1>

                    {success ? (
                        <div className="rg-success" role="status">
                            <strong>You're registered.</strong>
                            <p>Taking you to the login page…</p>
                        </div>
                    ) : step === 1 ? (
                        <form onSubmit={handleContinue} noValidate>
                            <label htmlFor="rg-id">Customer ID</label>
                            <input
                                id="rg-id"
                                name="customerId"
                                value={form.customerId}
                                onChange={handleChange}
                                className={idMissing ? "rg-invalid" : ""}
                                autoComplete="username"
                                autoFocus
                            />
                            {idMissing && <p className="rg-field-error">Please enter your Customer ID.</p>}

                            <div className="rg-captcha-row">
                                <div>
                                    <label>Security Code</label>
                                    <div className="rg-captcha-box">
                                        <CaptchaImage code={captcha} />
                                        <div className="rg-captcha-tools">
                                            <button type="button" className="rg-icon-btn" onClick={refreshCaptcha} aria-label="New code" title="New code">
                                                ↻
                                            </button>
                                            <button type="button" className="rg-icon-btn" onClick={speakCaptcha} aria-label="Read code aloud" title="Read aloud">
                                                🔊
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="rg-code">Enter the Code</label>
                                    <input
                                        id="rg-code"
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            {error && <p className="nb-error" role="alert">{error}</p>}

                            <button type="submit" className="nb-submit">Continue</button>
                           // after
                            <Link to={admin ? "/app/admin/users" : "/netbanking"} className="rg-outline-btn">
                                {admin ? "Back to Users" : "Back to Login"}
                            </Link>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <div className="nb-user-row">
                                <span>
                                    Customer ID: <strong>{form.customerId}</strong>
                                </span>
                                <button
                                    type="button"
                                    className="nb-link-button"
                                    onClick={() => {
                                        setStep(1);
                                        setError(null);
                                        refreshCaptcha();
                                    }}
                                >
                                    Change
                                </button>
                            </div>

                            <label htmlFor="rg-email">Email</label>
                            <input
                                id="rg-email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                                autoFocus
                            />

                            <label htmlFor="rg-pass" className="rg-spaced">Create password</label>
                            <input
                                id="rg-pass"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                            <label htmlFor="rg-confirm" className="rg-spaced">Confirm password</label>
                            <input
                                id="rg-confirm"
                                type="password"
                                name="confirm"
                                value={form.confirm}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                            {error && <p className="nb-error" role="alert">{error}</p>}

                            <button type="submit" className="nb-submit" disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                            <Link to="/netbanking" className="rg-outline-btn">Back to Login</Link>
                        </form>
                    )}

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