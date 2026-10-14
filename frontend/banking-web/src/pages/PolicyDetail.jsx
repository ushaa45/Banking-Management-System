import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminApi, PolicyApi } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";
import "./Claims.css";     // shared cl-* styles
import "./Policies.css";

/* Edit to match your roles. */
const STAFF_ROLES = ["SUPER_ADMIN", "BANK_ADMIN", "BRANCH_MANAGER"];
const ADMIN_ROLES = ["SUPER_ADMIN", "BANK_ADMIN"];

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const label = (s) => String(s || "").replace(/_/g, " ").toLowerCase();
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function PolicyDetail() {
  const { policyId } = useParams();
  const { user } = useAuth();
  const isStaff = user?.roles?.some((r) => STAFF_ROLES.includes(r));
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  const [policy, setPolicy] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [policyRes, historyRes] = await Promise.all([
        PolicyApi.getById(policyId),
        PolicyApi.getPremiumHistory(policyId),
      ]);
      setPolicy(policyRes.data);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch {
      setError("Could not load this policy.");
    }
  }, [policyId]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, success) => {
    setNotice(null);
    setActionError(null);
    setBusy(true);
    try {
      const res = await fn();
      await load();
      setNotice(typeof success === "function" ? success(res) : success);
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const runCollectionNow = () =>
    run(
      () => AdminApi.collectPremiums(),
      (res) => {
        const n = res.data?.policiesProcessed ?? 0;
        return `Job ran: ${n} polic${n === 1 ? "y" : "ies"} processed.`;
      }
    );

  const cancelPolicy = () => {
    if (!window.confirm("Cancel this policy? This can't be undone.")) return;
    run(() => PolicyApi.cancel(policyId), "Policy cancelled.");
  };

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => String(b.dueDate).localeCompare(String(a.dueDate))),
    [history]
  );
  const paidTotal = useMemo(
    () => history.filter((h) => String(h.status).toUpperCase() === "PAID" || String(h.status).toUpperCase() === "SUCCESS")
      .reduce((s, h) => s + Number(h.amount || 0), 0),
    [history]
  );

  if (error) return <p className="cl-alert error">{error}</p>;
  if (!policy) return <p>Loading…</p>;

  const customerId = policy.customerId ?? policy.customer?.customerId;
  const freq = label(policy.premiumFrequency);
  const missed = Number(policy.missedPremiumCount || 0);
  const active = String(policy.status).toUpperCase() === "ACTIVE";

  const details = [
    ["Policy number", policy.policyNumber],
    ["Type", label(policy.policyType)],
    ["Customer ID", customerId],
    ["Sum assured", inr(policy.sumAssured)],
    ["Premium", policy.premiumAmount != null ? `${inr(policy.premiumAmount)}${freq ? ` ${freq}` : ""}` : null],
    ["Premium account", policy.premiumAccountNumber],
    ["Next premium due", fmtDate(policy.nextPremiumDueDate)],
    ["Term", policy.policyTermYears ? `${policy.policyTermYears} years` : null],
    ["Start date", fmtDate(policy.startDate)],
    ["End date", fmtDate(policy.endDate)],
    ["Nominee", policy.nomineeName ? `${policy.nomineeName}${policy.nomineeRelationship ? ` (${policy.nomineeRelationship})` : ""}` : null],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <div className="cl-page">
      <Link className="cl-back" to="/app/policies">← Back to policies</Link>

      <div className="cl-head">
        <div>
          <h2>{policy.productName}</h2>
          <StatusBadge status={policy.status} />
        </div>
        <div className="cl-amount">
          <small>Sum assured</small>
          <strong>{inr(policy.sumAssured)}</strong>
        </div>
      </div>

      {missed > 0 && (
        <div className="cl-alert warn" role="alert">
          <strong>{missed} missed premium{missed === 1 ? "" : "s"}.</strong>
          <span>Pay the due premium soon to keep this policy in force.</span>
        </div>
      )}
      {notice && <div className="cl-alert success" role="status">{notice}</div>}
      {actionError && <div className="cl-alert error" role="alert">{actionError}</div>}

      <section className="cl-card">
        <h3>Policy details</h3>
        <dl className="cl-details">
          {details.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>

        <div className="pp-buttons">
          <Link className="cl-btn primary pp-link" to={`/app/claims?policyId=${policy.policyId ?? policyId}`}>File or view claims</Link>
          {isStaff && active && (
            <button type="button" className="cl-btn danger" disabled={busy} onClick={cancelPolicy}>
              Cancel policy
            </button>
          )}
        </div>
      </section>

      {isAdmin && (
        <section className="cl-card">
          <h3>Premium collection</h3>
          <p className="cl-muted">Runs the collection job for all policies that are due, not just this one.</p>
          <button type="button" className="cl-btn primary" disabled={busy} onClick={runCollectionNow}>
            {busy ? "Working…" : "Run collection now"}
          </button>
        </section>
      )}

      <section className="cl-card">
        <h3>Premium payment history</h3>

        {history.length === 0 ? (
          <p className="cl-empty">No premium payments recorded yet. None have come due.</p>
        ) : (
          <>
            <div className="cl-summary">
              <div><small>Payments</small><strong>{history.length}</strong></div>
              <div><small>Total paid</small><strong>{inr(paidTotal)}</strong></div>
            </div>

            <div className="cl-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Due date</th><th>Amount</th><th>Status</th><th>Detail</th><th>Processed</th></tr>
                </thead>
                <tbody>
                  {sortedHistory.map((h) => (
                    <tr key={h.paymentId}>
                      <td>{fmtDate(h.dueDate) || "—"}</td>
                      <td>{inr(h.amount)}</td>
                      <td><StatusBadge status={h.status} /></td>
                      <td>{h.failureReason || (h.transactionId ? `Txn #${h.transactionId}` : "—")}</td>
                      <td>{fmtDateTime(h.processedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}