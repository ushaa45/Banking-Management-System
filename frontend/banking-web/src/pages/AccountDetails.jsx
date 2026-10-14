import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AccountApi, TransactionApi } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function AccountDetails() {
  const { accountNumber } = useParams();
  const { user } = useAuth();
  const canManage = user?.roles?.some((r) => ["BRANCH_MANAGER", "BANK_ADMIN", "SUPER_ADMIN"].includes(r));

  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const navigate = useNavigate();

  const load = useCallback(() => {
    AccountApi.get(accountNumber).then((res) => setAccount(res.data)).catch(() => setLoadError("Account not found."));
    TransactionApi.history(accountNumber).then((res) => setHistory(res.data)).catch(() => { });
  }, [accountNumber]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (fn, successMessage) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(successMessage);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    runAction(() => TransactionApi.deposit({ accountNumber, amount: Number(depositAmount) }), `Deposited ${depositAmount}.`);
    setDepositAmount("");
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    runAction(() => TransactionApi.withdraw({ accountNumber, amount: Number(withdrawAmount) }), `Withdrew ${withdrawAmount}.`);
    setWithdrawAmount("");
  };

  if (loadError) return <p className="hint error">{loadError}</p>;
  if (!account) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 16px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#ffffff",
            color: "#334155",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back to Accounts
        </button>
      </div>
      <h2>Account {account.accountNumber}</h2>
      <div className="balance-card">
        <span className="stat-label">Available Balance</span>
        <span className="stat-value">{account.currency} {Number(account.balance).toLocaleString()}</span>
        <StatusBadge status={account.status} />
      </div>
      <p className="eyebrow-line">{account.accountType} account</p>

      {actionError && <p className="hint error">{actionError}</p>}
      {actionMessage && <div className="result-card">{actionMessage}</div>}

      <div className="two-col">
        <form className="form form-inline" onSubmit={handleDeposit}>
          <label>Deposit Amount
            <input type="number" min="0.05" step="0.01" value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)} required />
          </label>
          <button type="submit" style={{alignSelf: "flex-end"}}>Deposit</button>
        </form>

        <form className="form form-inline" onSubmit={handleWithdraw}>
          <label>Withdraw Amount
            <input type="number" min="0.01" step="0.01" value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)} required />
          </label>
          <button type="submit" style={{alignSelf: "flex-end"}}>Withdraw</button>
        </form>
      </div>

      {canManage && account.status === "ACTIVE" && (
        <button className="danger" style={{ marginTop: 16 }}
          onClick={() => runAction(() => AccountApi.freeze(accountNumber), "Account frozen.")}>
          Freeze Account
        </button>
      )}
      {canManage && account.status !== "CLOSED" && (
        <button className="danger" style={{ marginTop: 16, marginLeft: 8 }}
          onClick={() => runAction(() => AccountApi.close(accountNumber), "Account closed.")}>
          Close Account
        </button>
      )}

      <h3>Recent Transactions</h3>
      {history.length === 0 ? (
        <p className="empty-state">No transactions yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Reference</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {history.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.transactionReference}</td>
                <td>{t.transactionType}</td>
                <td>{t.amount}</td>
                <td><StatusBadge status={t.transactionStatus} /></td>
                <td>{t.transactionDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}