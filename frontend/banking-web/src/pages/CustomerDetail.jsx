import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AccountApi, CustomerApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";

const ACCOUNT_TYPES = ["SAVINGS", "CURRENT", "SALARY", "FD", "RD"];

export default function CustomerDetail() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [showOpenAccount, setShowOpenAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ accountType: "SAVINGS", openingBalance: "0" });
  const [accountError, setAccountError] = useState(null);
  const [accountResult, setAccountResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const [custRes, acctRes] = await Promise.all([
        CustomerApi.get(customerId),
        AccountApi.listForCustomer(customerId),
      ]);
      setCustomer(custRes.data);
      setAccounts(acctRes.data);
    } catch {
      setLoadError("Could not load this customer.");
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setAccountError(null);
    setAccountResult(null);
    try {
      const res = await AccountApi.open({
        customerId: Number(customerId),
        accountType: accountForm.accountType,
        openingBalance: Number(accountForm.openingBalance),
        currency: "INR",
      });
      setAccountResult(res.data);
      setShowOpenAccount(false);
      load();
    } catch (err) {
      setAccountError(err.response?.data?.message || "Could not open account.");
    }
  };

  if (loadError) return <p className="hint error">{loadError}</p>;
  if (!customer) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>{customer.firstName} {customer.lastName}</h2>
        <button className="btn btn-primary" onClick={() => setShowOpenAccount((v) => !v)}>
          {showOpenAccount ? "Close" : "Open Account"}
        </button>
      </div>
      <p className="eyebrow-line">Customer ID {customer.customerId}</p>

      <div className="profile-grid">
        <div className="profile-field">
          <span className="profile-field-label">Email</span>
          <span className="profile-field-value">{customer.email}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Phone</span>
          <span className="profile-field-value">{customer.phone}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Date of Birth</span>
          <span className="profile-field-value">{customer.dateOfBirth || "—"}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">KYC Status</span>
          <StatusBadge status={customer.kycStatus} />
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Account Status</span>
          <StatusBadge status={customer.status} />
        </div>
      </div>

      {showOpenAccount && (
        <form className="form" onSubmit={handleOpenAccount}>
          <label>Account Type
            <select value={accountForm.accountType}
              onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}>
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>Opening Balance
            <input type="number" min="0" value={accountForm.openingBalance}
              onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })} />
          </label>
          <button type="submit">Open Account</button>
        </form>
      )}
      {accountError && <p className="hint error">{accountError}</p>}
      {accountResult && (
        <div className="result-card">
          Account {accountResult.accountNumber} opened.{" "}
          <Link to={`/accounts/${accountResult.accountNumber}`}>View account</Link>
        </div>
      )}

      <h3>Accounts</h3>
      {accounts.length === 0 ? (
        <p className="empty-state">No accounts yet. Open one above.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Account #</th><th>Type</th><th>Balance</th><th>Status</th></tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.accountId}>
                <td><Link to={`/accounts/${a.accountNumber}`}>{a.accountNumber}</Link></td>
                <td>{a.accountType}</td>
                <td>{a.currency} {Number(a.balance).toLocaleString()}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}