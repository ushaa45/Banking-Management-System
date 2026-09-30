import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoanApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";
const WORKFLOW_ACTIONS = [
  { status: "APPLIED", label: "Verify KYC", action: "kycVerify" },
  { status: "KYC_VERIFIED", label: "Evaluate Credit", action: "creditEvaluate" },
  { status: "CREDIT_EVALUATED", label: "Approve", action: "approve" },
  { status: "APPROVED", label: "Sanction", action: "sanction" },
];

export default function LoanDetail() {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [disburseAccount, setDisburseAccount] = useState("");

  const load = useCallback(async () => {
    try {
      const [loanRes, emiRes] = await Promise.all([
        LoanApi.getById(loanId),
        LoanApi.getEmis(loanId),
      ]);
      setLoan(loanRes.data);
      setEmis(emiRes.data);
    } catch {
      setLoadError("Could not load this loan.");
    }
  }, [loanId]);

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

  const handleDisburse = (e) => {
    e.preventDefault();
    runAction(() => LoanApi.disburse(loanId, { toAccountNumber: disburseAccount }));
  };

  if (loadError) return <p className="hint error">{loadError}</p>;
  if (!loan) return <p>Loading...</p>;

  const nextStep = WORKFLOW_ACTIONS.find((s) => s.status === loan.status);

  return (
    <div>
      <h2>Loan #{loan.loanId}</h2>
      <div className="balance-card">
        <span className="stat-label">{loan.loanType} &middot; {loan.tenureMonths} months</span>
        <span className="stat-value">₹{Number(loan.principalAmount).toLocaleString()}</span>
        <StatusBadge status={loan.status} />
      </div>

      {actionError && <p className="hint error">{actionError}</p>}

      {nextStep && (
        <button onClick={() => runAction(() => LoanApi[nextStep.action](loanId))}>
          {nextStep.label}
        </button>
      )}

      {loan.status === "SANCTIONED" && (
        <form className="form form-inline" onSubmit={handleDisburse}>
          <label>Disburse to Account
            <input value={disburseAccount} onChange={(e) => setDisburseAccount(e.target.value)} required />
          </label>
          <button type="submit">Disburse</button>
        </form>
      )}

      {!["DISBURSED", "CLOSED", "REJECTED"].includes(loan.status) && (
        <button className="danger" onClick={() => runAction(() => LoanApi.reject(loanId))}>
          Reject Loan
        </button>
      )}

      {emis.length > 0 && (
        <>
          <h3>EMI Schedule</h3>
          <table className="data-table">
            <thead>
              <tr><th>Due Date</th><th>Amount</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {emis.map((emi) => (
                <tr key={emi.emiId}>
                  <td>{emi.dueDate}</td>
                  <td>{emi.emiAmount}</td>
                  <td><StatusBadge status={emi.status} /></td>
                  <td>
                    {emi.status === "DUE" && (
                      <button onClick={() => runAction(() => LoanApi.payEmi(emi.emiId, { paidAmount: emi.emiAmount }))}>
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}