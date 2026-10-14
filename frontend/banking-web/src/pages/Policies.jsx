import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PolicyApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import "./Claims.css";     // shared cl-* styles
import "./Policies.css";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const label = (s) => String(s || "").replace(/_/g, " ").toLowerCase();

const emptyForm = {
  customerId: "", policyType: "LIFE", productName: "", sumAssured: "",
  premiumAmount: "", premiumFrequency: "MONTHLY", premiumAccountNumber: "",
  nomineeName: "", nomineeRelationship: "", policyTermYears: "",
};

function validate(f) {
  const e = {};
  if (!String(f.customerId).trim()) e.customerId = "Enter the customer ID.";
  if (!f.productName.trim()) e.productName = "Enter the product name.";
  if (!(Number(f.sumAssured) > 0)) e.sumAssured = "Enter a sum assured above zero.";
  if (!(Number(f.premiumAmount) > 0)) e.premiumAmount = "Enter a premium above zero.";
  if (!f.premiumAccountNumber.trim()) e.premiumAccountNumber = "Enter the premium account number.";
  const term = Number(f.policyTermYears);
  if (!Number.isInteger(term) || term < 1) e.policyTermYears = "Enter the term in whole years (1 or more).";
  if (f.nomineeRelationship.trim() && !f.nomineeName.trim()) e.nomineeName = "Enter the nominee's name.";
  return e;
}

function Field({ label: text, error, hint, children, id }) {
  return (
    <div className={`cl-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{text}</label>
      {children}
      {hint && !error && <p className="cl-count">{hint}</p>}
      {error && <p className="cl-err">{error}</p>}
    </div>
  );
}

export default function Policies() {
  const [tab, setTab] = useState("issue");

  /* ---------- issue ---------- */
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [issuing, setIssuing] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const [issueError, setIssueError] = useState(null);

  /* ---------- lookup ---------- */
  const [lookupCustomer, setLookupCustomer] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadPolicies = useCallback(async (customerId) => {
    const id = String(customerId ?? "").trim();
    if (!id) return;
    setLoading(true);
    setLookupError(null);
    setStatusFilter("ALL");
    try {
      const res = await PolicyApi.getByCustomer(id);
      setPolicies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPolicies([]);
      setLookupError(err.response?.data?.message || "Could not load policies for this customer.");
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssueError(null);
    setIssueResult(null);

    const er = validate(form);
    setErrors(er);
    if (Object.keys(er).length) return;

    setIssuing(true);
    try {
      const res = await PolicyApi.issue({
        ...form,
        customerId: form.customerId.trim(),
        sumAssured: Number(form.sumAssured),
        premiumAmount: Number(form.premiumAmount),
        policyTermYears: Number(form.policyTermYears),
      });
      setIssueResult(res.data);
      setLookupCustomer(form.customerId.trim());
      loadPolicies(form.customerId.trim());                 // keep the list current
      setForm({ ...emptyForm, customerId: form.customerId }); // clear the rest
    } catch (err) {
      setIssueError(err.response?.data?.message || "Could not issue policy.");
    } finally {
      setIssuing(false);
    }
  };

  /* ---------- derived ---------- */
  const statuses = useMemo(() => ["ALL", ...new Set(policies.map((p) => p.status).filter(Boolean))], [policies]);
  const visible = useMemo(
    () => (statusFilter === "ALL" ? policies : policies.filter((p) => p.status === statusFilter)),
    [policies, statusFilter]
  );
  const totalCover = useMemo(() => policies.reduce((s, p) => s + Number(p.sumAssured || 0), 0), [policies]);
  const countOf = (s) => (s === "ALL" ? policies.length : policies.filter((p) => p.status === s).length);

  return (
    <div className="cl-page">
      <h2>Policies</h2>
      <p className="cl-sub">Issue a new policy or look up a customer's policies.</p>

      <div className="cl-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "issue"}
          className={tab === "issue" ? "active" : ""} onClick={() => setTab("issue")}>
          Issue policy
        </button>
        <button type="button" role="tab" aria-selected={tab === "view"}
          className={tab === "view" ? "active" : ""} onClick={() => setTab("view")}>
          View policies {searched && <span>{policies.length}</span>}
        </button>
      </div>

      {/* ================= ISSUE ================= */}
      {tab === "issue" && (
        <section className="cl-card">
          {issueResult && (
            <div className="cl-alert success" role="status">
              <strong>Policy {issueResult.policyNumber} issued.</strong>
              {issueResult.endDate && <span>Valid until {issueResult.endDate}.</span>}
              <span className="cl-alert-links">
                {issueResult.policyId && <Link to={`/app/policies/${issueResult.policyId}`}>View details</Link>}
                <button type="button" className="cl-linkbtn" onClick={() => setTab("view")}>See all policies</button>
              </span>
            </div>
          )}
          {issueError && <div className="cl-alert error" role="alert">{issueError}</div>}

          <form onSubmit={handleIssue} noValidate>
            <h3 className="pp-section">Policy</h3>
            <div className="cl-grid">
              <Field id="p-cust" label="Customer ID" error={errors.customerId}>
                <input id="p-cust" name="customerId" value={form.customerId} onChange={handleChange} />
              </Field>
              <Field id="p-type" label="Policy type">
                <select id="p-type" name="policyType" value={form.policyType} onChange={handleChange}>
                  <option value="LIFE">Life</option>
                  <option value="HEALTH">Health</option>
                  <option value="GENERAL">General</option>
                </select>
              </Field>
            </div>
            <Field id="p-name" label="Product name" error={errors.productName}>
              <input id="p-name" name="productName" value={form.productName} onChange={handleChange}
                placeholder="e.g. SecureLife Term Plan" />
            </Field>
            <div className="cl-grid">
              <Field id="p-sum" label="Sum assured (₹)" error={errors.sumAssured}>
                <input id="p-sum" type="number" min="1" name="sumAssured" value={form.sumAssured} onChange={handleChange} />
              </Field>
              <Field id="p-term" label="Policy term (years)" error={errors.policyTermYears}>
                <input id="p-term" type="number" min="1" step="1" name="policyTermYears"
                  value={form.policyTermYears} onChange={handleChange} />
              </Field>
            </div>

            <h3 className="pp-section">Premium</h3>
            <div className="pp-three">
              <Field id="p-prem" label="Amount (₹)" error={errors.premiumAmount}>
                <input id="p-prem" type="number" min="1" name="premiumAmount" value={form.premiumAmount} onChange={handleChange} />
              </Field>
              <Field id="p-freq" label="Frequency">
                <select id="p-freq" name="premiumFrequency" value={form.premiumFrequency} onChange={handleChange}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                </select>
              </Field>
              <Field id="p-acct" label="Premium account" error={errors.premiumAccountNumber}>
                <input id="p-acct" name="premiumAccountNumber" value={form.premiumAccountNumber} onChange={handleChange} />
              </Field>
            </div>

            <h3 className="pp-section">Nominee <small>(optional)</small></h3>
            <div className="cl-grid">
              <Field id="p-nom" label="Name" error={errors.nomineeName}>
                <input id="p-nom" name="nomineeName" value={form.nomineeName} onChange={handleChange} />
              </Field>
              <Field id="p-rel" label="Relationship">
                <input id="p-rel" name="nomineeRelationship" value={form.nomineeRelationship} onChange={handleChange} />
              </Field>
            </div>

            <button type="submit" className="cl-btn primary" disabled={issuing}>
              {issuing ? "Issuing…" : "Issue policy"}
            </button>
          </form>
        </section>
      )}

      {/* ================= VIEW ================= */}
      {tab === "view" && (
        <section className="cl-card">
          <h3>Policies by customer</h3>

          <form className="cl-lookup" onSubmit={(e) => { e.preventDefault(); loadPolicies(lookupCustomer); }}>
            <div className="cl-field">
              <label htmlFor="p-lookup">Customer ID</label>
              <input id="p-lookup" value={lookupCustomer} onChange={(e) => setLookupCustomer(e.target.value)} required />
            </div>
            <button type="submit" className="cl-btn primary" disabled={loading || !lookupCustomer.trim()}>
              {loading ? "Loading…" : "Load policies"}
            </button>
          </form>

          {lookupError && <div className="cl-alert error" role="alert">{lookupError}</div>}

          {searched && !lookupError && policies.length > 0 && (
            <>
              <div className="cl-summary">
                <div><small>Policies</small><strong>{policies.length}</strong></div>
                <div><small>Total sum assured</small><strong>{inr(totalCover)}</strong></div>
              </div>

              <div className="cl-chips" role="group" aria-label="Filter by status">
                {statuses.map((s) => (
                  <button key={s} type="button" className={statusFilter === s ? "active" : ""}
                    onClick={() => setStatusFilter(s)}>
                    {s === "ALL" ? "All" : label(s)} <span>{countOf(s)}</span>
                  </button>
                ))}
              </div>

              <div className="cl-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Policy #</th><th>Type</th><th>Product</th><th>Sum assured</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.policyId}>
                        <td>{p.policyNumber}</td>
                        <td>{label(p.policyType)}</td>
                        <td>{p.productName}</td>
                        <td>{inr(p.sumAssured)}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td className="pp-actions">
                          <Link to={`/app/policies/${p.policyId}`}>View</Link>
                          <Link to={`/app/claims?policyId=${p.policyId}`}>Claims</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {searched && !lookupError && policies.length === 0 && !loading && (
            <p className="cl-empty">No policies found for this customer.</p>
          )}
          {!searched && !loading && <p className="cl-empty">Enter a customer ID to see their policies.</p>}
        </section>
      )}
    </div>
  );
}