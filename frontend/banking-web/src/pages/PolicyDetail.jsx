import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminApi, PolicyApi } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function PolicyDetail() {
  const { policyId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((r) => ["SUPER_ADMIN", "BANK_ADMIN"].includes(r));

  const [policy, setPolicy] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [runMessage, setRunMessage] = useState(null);

  const load = useCallback(async () => {
    try {
      const [policyRes, historyRes] = await Promise.all([
        PolicyApi.getById(policyId),
        PolicyApi.getPremiumHistory(policyId),
      ]);
      setPolicy(policyRes.data);
      setHistory(historyRes.data);
    } catch {
      setError("Could not load this policy.");
    }
  }, [policyId]);

  useEffect(() => { load(); }, [load]);

  const runCollectionNow = async () => {
    setRunMessage(null);
    try {
      const res = await AdminApi.collectPremiums();
      setRunMessage(`Job ran: ${res.data.policiesProcessed} polic${res.data.policiesProcessed === 1 ? "y" : "ies"} processed.`);
      await load();
    } catch (err) {
      setRunMessage(err.response?.data?.message || "Could not trigger the job.");
    }
  };

  if (error) return <p className="hint error">{error}</p>;
  if (!policy) return <p>Loading...</p>;

  return (
    <div>
      <h2>Policy {policy.policyNumber}</h2>
      <div className="balance-card">
        <span className="stat-label">{policy.productName}</span>
        <span className="stat-value">₹{Number(policy.sumAssured).toLocaleString()} sum assured</span>
        <span className="badge">{policy.status}</span>
        <p className="hint">
          Premium ₹{policy.premiumAmount} {policy.premiumFrequency.toLowerCase()} &middot;
          {" "}Next due: {policy.nextPremiumDueDate || "—"}
          {policy.missedPremiumCount > 0 && ` · ${policy.missedPremiumCount} missed`}
        </p>
      </div>

      {isAdmin && (
        <div>
          <button onClick={runCollectionNow}>Run Premium Collection Now (all due policies)</button>
          {runMessage && <p className="hint">{runMessage}</p>}
        </div>
      )}

      <h3>Premium Payment History</h3>
      {history.length === 0 ? (
        <p className="hint">No premium payments recorded yet — none have come due.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Due Date</th><th>Amount</th><th>Status</th><th>Detail</th><th>Processed</th></tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.paymentId}>
                <td>{h.dueDate}</td>
                <td>{h.amount}</td>
                <td><StatusBadge status={h.status}/></td>
                <td>{h.failureReason || (h.transactionId ? `Txn #${h.transactionId}` : "—")}</td>
                <td>{h.processedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}