import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ClaimApi } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";
import "./Claims.css";

/* Roles allowed to review, approve, reject and settle. Edit to match your roles. */
/* Match ClaimController's @PreAuthorize rules. */
const REVIEW_ROLES = ["BANK_EMPLOYEE", "BRANCH_MANAGER", "BANK_ADMIN", "SUPER_ADMIN"];
const DECIDE_ROLES = ["BRANCH_MANAGER", "BANK_ADMIN", "SUPER_ADMIN"];   // approve, reject, settle

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const label = (s) => String(s || "").replace(/_/g, " ");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

export default function ClaimDetail() {
  const { claimId } = useParams();
  const { user } = useAuth();
  const canReview = user?.roles?.some((r) => REVIEW_ROLES.includes(r));
  const canDecide = user?.roles?.some((r) => DECIDE_ROLES.includes(r));

  const [claim, setClaim] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const [approvedAmount, setApprovedAmount] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [settleAccount, setSettleAccount] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await ClaimApi.getById(claimId);
      setClaim(res.data);
    } catch {
      setLoadError("Could not load this claim.");
    }
  }, [claimId]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (fn, successMessage) => {
    setActionError(null);
    setNotice(null);
    setBusy(true);
    try {
      await fn();
      await load();
      setNotice(successMessage);
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loadError) return <p className="cl-alert error">{loadError}</p>;
  if (!claim) return <p>Loading…</p>;

  const policyId = claim.policyId ?? claim.policy?.policyId;

  /* progress timeline */
  const rejected = claim.status === "REJECTED";
  const steps = rejected ? ["FILED", "UNDER_REVIEW", "REJECTED"] : ["FILED", "UNDER_REVIEW", "APPROVED", "SETTLED"];
  const currentIndex = Math.max(0, steps.indexOf(claim.status));

  const details = [
    ["Reference", claim.claimReference],
    ["Policy ID", policyId],
    ["Claimed amount", inr(claim.claimAmount)],
    ["Approved amount", claim.approvedAmount != null ? inr(claim.approvedAmount) : null],
    ["Reason", claim.reason],
    ["Filed on", fmtDate(claim.claimDate ?? claim.filedDate ?? claim.createdAt)],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <div className="cl-page">
      <Link className="cl-back" to={policyId ? `/app/claims?policyId=${policyId}` : "/app/claims"}>
        ← Back to claims
      </Link>

      <div className="cl-head">
        <div>
          <h2>Claim {claim.claimReference}</h2>
          <StatusBadge status={claim.status} />
        </div>
        <div className="cl-amount">
          <small>Claimed amount</small>
          <strong>{inr(claim.claimAmount)}</strong>
        </div>
      </div>

      {/* ---------- progress ---------- */}
      <ol className="cl-timeline" aria-label="Claim progress">
        {steps.map((s, i) => (
          <li key={s} className={`${i < currentIndex ? "done" : ""} ${i === currentIndex ? "current" : ""} ${s === "REJECTED" ? "bad" : ""}`}>
            <span>{i < currentIndex ? "✓" : s === "REJECTED" ? "✕" : i + 1}</span>
            {label(s)}
          </li>
        ))}
      </ol>

      {rejected && claim.rejectionReason && (
        <div className="cl-alert error"><strong>Rejected:</strong> {claim.rejectionReason}</div>
      )}

      {/* ---------- details ---------- */}
      <section className="cl-card">
        <h3>Details</h3>
        <dl className="cl-details">
          {details.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </section>

      {notice && <div className="cl-alert success" role="status">{notice}</div>}
      {actionError && <div className="cl-alert error" role="alert">{actionError}</div>}

            {/* ---------- actions: roles match ClaimController ---------- */}
      {claim.status === "FILED" && canReview && (
        <section className="cl-card">
          <h3>Review</h3>
          <p className="cl-muted">Move this claim into review so a manager can decide on it.</p>
          <button type="button" className="cl-btn primary" disabled={busy}
            onClick={() => runAction(() => ClaimApi.review(claimId), "Claim moved to review.")}>
            {busy ? "Working…" : "Mark under review"}
          </button>
        </section>
      )}

      {claim.status === "UNDER_REVIEW" && canDecide && (
        <div className="cl-two">
          <form className="cl-card" onSubmit={(e) => {
            e.preventDefault();
            const amount = approvedAmount ? Number(approvedAmount) : Number(claim.claimAmount);
            if (amount <= 0) return setActionError("Approved amount must be above zero.");
            if (amount > Number(claim.claimAmount)) return setActionError("Approved amount can't exceed the claimed amount.");
            runAction(() => ClaimApi.approve(claimId, { approvedAmount: amount }), "Claim approved.");
          }}>
            <h3>Approve</h3>
            <div className="cl-field">
              <label htmlFor="cl-approved">Approved amount (₹)</label>
              <input id="cl-approved" type="number" min="1" step="0.01" value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)} placeholder={String(claim.claimAmount)} />
              <p className="cl-count">Leave blank to approve the full claimed amount.</p>
            </div>
            <button type="submit" className="cl-btn primary" disabled={busy}>Approve</button>
          </form>

          <form className="cl-card" onSubmit={(e) => {
            e.preventDefault();
            if (!window.confirm("Reject this claim? This can't be undone.")) return;
            runAction(() => ClaimApi.reject(claimId, { rejectionReason: rejectionReason.trim() }), "Claim rejected.");
          }}>
            <h3>Reject</h3>
            <div className="cl-field">
              <label htmlFor="cl-reject">Rejection reason</label>
              <input id="cl-reject" value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)} required />
            </div>
            <button type="submit" className="cl-btn danger" disabled={busy}>Reject</button>
          </form>
        </div>
      )}

      {claim.status === "APPROVED" && canDecide && (
        <form className="cl-card" onSubmit={(e) => {
          e.preventDefault();
          if (!window.confirm(`Pay ${inr(claim.approvedAmount ?? claim.claimAmount)} to account ${settleAccount}?`)) return;
          runAction(() => ClaimApi.settle(claimId, { toAccountNumber: settleAccount.trim() }), "Claim settled.");
        }}>
          <h3>Settle claim</h3>
          <div className="cl-field">
            <label htmlFor="cl-settle">Settle to account number</label>
            <input id="cl-settle" value={settleAccount}
              onChange={(e) => setSettleAccount(e.target.value)} required />
          </div>
          <button type="submit" className="cl-btn primary" disabled={busy}>
            {busy ? "Settling…" : "Settle claim"}
          </button>
        </form>
      )}

      {/* message when the signed-in user can't act on the current status */}
      {!(
        (claim.status === "FILED" && canReview) ||
        (["UNDER_REVIEW", "APPROVED"].includes(claim.status) && canDecide)
      ) && !["SETTLED", "REJECTED"].includes(claim.status) && (
        <p className="cl-muted">
          {claim.status === "UNDER_REVIEW" && canReview && !canDecide
            ? "This claim is waiting for a branch manager to approve or reject it."
            : "Our team is processing this claim. This page updates as its status changes."}
        </p>
      )}
    </div>
  );
}