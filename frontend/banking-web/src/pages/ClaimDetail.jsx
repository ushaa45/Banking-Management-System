import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClaimApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";

export default function ClaimDetail() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);

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

  const runAction = async (fn) => {
    setActionError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed.");
    }
  };

  if (loadError) return <p className="hint error">{loadError}</p>;
  if (!claim) return <p>Loading...</p>;

  return (
    <div>
      <h2>Claim {claim.claimReference}</h2>
      <div className="balance-card">
        <span className="stat-label">Claimed Amount</span>
        <span className="stat-value">₹{Number(claim.claimAmount).toLocaleString()}</span>
        <StatusBadge status={claim.status} />
        {claim.approvedAmount && (
          <p className="hint">Approved: ₹{Number(claim.approvedAmount).toLocaleString()}</p>
        )}
        {claim.rejectionReason && <p className="hint error">Rejected: {claim.rejectionReason}</p>}
      </div>

      {actionError && <p className="hint error">{actionError}</p>}

      {claim.status === "FILED" && (
        <button onClick={() => runAction(() => ClaimApi.review(claimId))}>Mark Under Review</button>
      )}

      {claim.status === "UNDER_REVIEW" && (
        <div className="two-col">
          <form className="form form-inline" onSubmit={(e) => {
            e.preventDefault();
            runAction(() => ClaimApi.approve(claimId, approvedAmount ? { approvedAmount: Number(approvedAmount) } : {}));
          }}>
            <label>Approved Amount (optional)
              <input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} placeholder={claim.claimAmount} />
            </label>
            <button type="submit">Approve</button>
          </form>

          <form className="form form-inline" onSubmit={(e) => {
            e.preventDefault();
            runAction(() => ClaimApi.reject(claimId, { rejectionReason }));
          }}>
            <label>Rejection Reason
              <input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} required />
            </label>
            <button type="submit" className="danger">Reject</button>
          </form>
        </div>
      )}

      {claim.status === "APPROVED" && (
        <form className="form form-inline" onSubmit={(e) => {
          e.preventDefault();
          runAction(() => ClaimApi.settle(claimId, { toAccountNumber: settleAccount }));
        }}>
          <label>Settle to Account
            <input value={settleAccount} onChange={(e) => setSettleAccount(e.target.value)} required />
          </label>
          <button type="submit">Settle Claim</button>
        </form>
      )}
    </div>
  );
}