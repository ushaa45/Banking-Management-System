import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ClaimApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import "./Claims.css";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const isId = (v) => /^\d+$/.test(String(v).trim());
const label = (s) => String(s || "").replace(/_/g, " ");

export default function Claims() {
  const [searchParams] = useSearchParams();
  const presetPolicy = searchParams.get("policyId") || "";
  const presetCustomer = searchParams.get("customerId") || "";

  const [tab, setTab] = useState(presetPolicy || presetCustomer ? "track" : "file");

  /* ---------- file a claim ---------- */
  const [form, setForm] = useState({ policyId: presetPolicy, claimAmount: "", reason: "" });
  const [errors, setErrors] = useState({});
  const [filing, setFiling] = useState(false);
  const [fileResult, setFileResult] = useState(null);
  const [fileError, setFileError] = useState(null);

  /* ---------- track claims ---------- */
  const [mode, setMode] = useState(presetCustomer && !presetPolicy ? "customer" : "policy");
  const [lookupId, setLookupId] = useState(presetPolicy || presetCustomer);
  const [lookupMsg, setLookupMsg] = useState(null);       // validation message
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadClaims = useCallback(async (lookupMode, id) => {
    const value = String(id ?? "").trim();
    setLookupMsg(null);
    if (!value) return;
    if (!isId(value)) {
      setLookupMsg(`${lookupMode === "policy" ? "Policy" : "Customer"} ID must be a number.`);
      return;
    }

    setLoading(true);
    setLookupError(null);
    setStatusFilter("ALL");
    try {
      const res =
        lookupMode === "policy" ? await ClaimApi.getByPolicy(value) : await ClaimApi.getByCustomer(value);
      setClaims(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setClaims([]);
      setLookupError(
        err.response?.data?.message ||
          `Could not load claims for this ${lookupMode === "policy" ? "policy" : "customer"}.`
      );
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }, []);

  // open from /app/claims?policyId=12 or ?customerId=5
  useEffect(() => {
    if (presetPolicy) loadClaims("policy", presetPolicy);
    else if (presetCustomer) loadClaims("customer", presetCustomer);
  }, [presetPolicy, presetCustomer, loadClaims]);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleFile = async (e) => {
    e.preventDefault();
    setFileError(null);
    setFileResult(null);

    const er = {};
    if (!isId(form.policyId)) er.policyId = "Enter the policy ID (a number).";
    const amount = Number(form.claimAmount);
    if (!amount || amount <= 0) er.claimAmount = "Enter an amount greater than zero.";
    setErrors(er);
    if (Object.keys(er).length) return;

    setFiling(true);
    try {
      const res = await ClaimApi.file({
        policyId: Number(form.policyId),
        claimAmount: amount,
        reason: form.reason.trim(),
      });
      setFileResult(res.data);

      // show the new claim in the Track tab
      setMode("policy");
      setLookupId(form.policyId.trim());
      loadClaims("policy", form.policyId.trim());
      setForm((f) => ({ ...f, claimAmount: "", reason: "" }));
    } catch (err) {
      setFileError(err.response?.data?.message || "Could not file claim.");
    } finally {
      setFiling(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setLookupId("");
    setClaims([]);
    setSearched(false);
    setLookupError(null);
    setLookupMsg(null);
  };

  /* ---------- derived ---------- */
  const statuses = useMemo(() => ["ALL", ...new Set(claims.map((c) => c.status).filter(Boolean))], [claims]);
  const visible = useMemo(
    () => (statusFilter === "ALL" ? claims : claims.filter((c) => c.status === statusFilter)),
    [claims, statusFilter]
  );
  const totalClaimed = useMemo(() => claims.reduce((s, c) => s + Number(c.claimAmount || 0), 0), [claims]);
  const showPolicyCol = claims.some((c) => c.policyId != null);
  const countOf = (s) => (s === "ALL" ? claims.length : claims.filter((c) => c.status === s).length);

  return (
    <div className="cl-page">
      <h2>Claims</h2>
      <p className="cl-sub">File a new claim or follow the progress of existing ones.</p>

      <div className="cl-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "file"}
          className={tab === "file" ? "active" : ""} onClick={() => setTab("file")}>
          File a claim
        </button>
        <button type="button" role="tab" aria-selected={tab === "track"}
          className={tab === "track" ? "active" : ""} onClick={() => setTab("track")}>
          Track claims {searched && <span>{claims.length}</span>}
        </button>
      </div>

      {/* ================= FILE ================= */}
      {tab === "file" && (
        <section className="cl-card">
          <h3>New claim</h3>

          {fileResult && (
            <div className="cl-alert success" role="status">
              <strong>Claim {fileResult.claimReference} filed.</strong>
              <span>Status: <StatusBadge status={fileResult.status} /></span>
              <span className="cl-alert-links">
                <Link to={`/app/claims/${fileResult.claimId}`}>View details</Link>
                <button type="button" className="cl-linkbtn" onClick={() => setTab("track")}>Track this claim</button>
              </span>
            </div>
          )}
          {fileError && <div className="cl-alert error" role="alert">{fileError}</div>}

          <form className="cl-form" onSubmit={handleFile} noValidate>
            <div className="cl-grid">
              <div className={`cl-field ${errors.policyId ? "has-error" : ""}`}>
                <label htmlFor="cl-policy">Policy ID</label>
                <input id="cl-policy" name="policyId" inputMode="numeric" value={form.policyId} onChange={handleChange} />
                {errors.policyId && <p className="cl-err">{errors.policyId}</p>}
              </div>

              <div className={`cl-field ${errors.claimAmount ? "has-error" : ""}`}>
                <label htmlFor="cl-amount">Claim amount (₹)</label>
                <input id="cl-amount" name="claimAmount" type="number" min="1" step="0.01"
                  value={form.claimAmount} onChange={handleChange} />
                {errors.claimAmount && <p className="cl-err">{errors.claimAmount}</p>}
              </div>
            </div>

            <div className="cl-field">
              <label htmlFor="cl-reason">Reason <small>(optional)</small></label>
              <textarea id="cl-reason" name="reason" rows={3} maxLength={500}
                placeholder="Briefly describe what happened"
                value={form.reason} onChange={handleChange} />
              <p className="cl-count">{form.reason.length}/500</p>
            </div>

            <button type="submit" className="cl-btn primary" disabled={filing}>
              {filing ? "Filing…" : "File claim"}
            </button>
          </form>
        </section>
      )}

      {/* ================= TRACK ================= */}
      {tab === "track" && (
        <section className="cl-card">
          <h3>Find claims</h3>

          <div className="cl-chips" role="group" aria-label="Search by">
            <button type="button" className={mode === "policy" ? "active" : ""} onClick={() => switchMode("policy")}>
              By policy
            </button>
            <button type="button" className={mode === "customer" ? "active" : ""} onClick={() => switchMode("customer")}>
              By customer
            </button>
          </div>

          <form className="cl-lookup" onSubmit={(e) => { e.preventDefault(); loadClaims(mode, lookupId); }}>
            <div className={`cl-field ${lookupMsg ? "has-error" : ""}`}>
              <label htmlFor="cl-lookup">{mode === "policy" ? "Policy ID" : "Customer ID"}</label>
              <input id="cl-lookup" inputMode="numeric" value={lookupId}
                onChange={(e) => { setLookupId(e.target.value); setLookupMsg(null); }} />
              {lookupMsg && <p className="cl-err">{lookupMsg}</p>}
            </div>
            <button type="submit" className="cl-btn primary" disabled={loading || !lookupId.trim()}>
              {loading ? "Loading…" : "Load claims"}
            </button>
          </form>

          {lookupError && <div className="cl-alert error" role="alert">{lookupError}</div>}

          {searched && !lookupError && claims.length > 0 && (
            <>
              <div className="cl-summary">
                <div><small>Claims</small><strong>{claims.length}</strong></div>
                <div><small>Total claimed</small><strong>{inr(totalClaimed)}</strong></div>
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
                    <tr>
                      <th>Reference</th>
                      {showPolicyCol && <th>Policy</th>}
                      <th>Claimed</th><th>Approved</th><th>Status</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((c) => (
                      <tr key={c.claimId}>
                        <td>{c.claimReference}</td>
                        {showPolicyCol && (
                          <td>{c.policyId != null ? <Link to={`/app/policies/${c.policyId}`}>#{c.policyId}</Link> : "—"}</td>
                        )}
                        <td>{inr(c.claimAmount)}</td>
                        <td>{c.approvedAmount != null ? inr(c.approvedAmount) : "—"}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td><Link to={`/app/claims/${c.claimId}`}>View →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {searched && !lookupError && claims.length === 0 && !loading && (
            <p className="cl-empty">No claims found.</p>
          )}
          {!searched && !loading && (
            <p className="cl-empty">Enter a {mode === "policy" ? "policy" : "customer"} ID to see its claims.</p>
          )}
        </section>
      )}
    </div>
  );
}