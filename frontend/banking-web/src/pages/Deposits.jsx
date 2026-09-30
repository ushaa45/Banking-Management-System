import { useState } from "react";
import { FixedDepositApi, RecurringDepositApi } from "../api/api";

export default function Deposits() {
  const [fdForm, setFdForm] = useState({ accountNumber: "", principalAmount: "", interestRate: "", tenureMonths: "" });
  const [fdResult, setFdResult] = useState(null);
  const [fdError, setFdError] = useState(null);

  const [rdForm, setRdForm] = useState({ accountNumber: "", monthlyInstallment: "", interestRate: "", tenureMonths: "" });
  const [rdResult, setRdResult] = useState(null);
  const [rdError, setRdError] = useState(null);

  const [lookupAccount, setLookupAccount] = useState("");
  const [fdList, setFdList] = useState([]);
  const [rdList, setRdList] = useState([]);
  const [lookupError, setLookupError] = useState(null);

  const handleFdChange = (e) => setFdForm({ ...fdForm, [e.target.name]: e.target.value });
  const handleRdChange = (e) => setRdForm({ ...rdForm, [e.target.name]: e.target.value });

  const loadDeposits = async (e) => {
    e?.preventDefault();
    setLookupError(null);
    try {
      const [fdRes, rdRes] = await Promise.all([
        FixedDepositApi.getByAccount(lookupAccount),
        RecurringDepositApi.getByAccount(lookupAccount),
      ]);
      setFdList(fdRes.data);
      setRdList(rdRes.data);
    } catch {
      setLookupError("Could not load deposits for this account.");
    }
  };

  const openFd = async (e) => {
    e.preventDefault();
    setFdError(null);
    setFdResult(null);
    try {
      const res = await FixedDepositApi.open({
        ...fdForm,
        principalAmount: Number(fdForm.principalAmount),
        interestRate: Number(fdForm.interestRate),
        tenureMonths: Number(fdForm.tenureMonths),
      });
      setFdResult(res.data);
    } catch (err) {
      setFdError(err.response?.data?.message || "Could not open fixed deposit.");
    }
  };

  const openRd = async (e) => {
    e.preventDefault();
    setRdError(null);
    setRdResult(null);
    try {
      const res = await RecurringDepositApi.open({
        ...rdForm,
        monthlyInstallment: Number(rdForm.monthlyInstallment),
        interestRate: Number(rdForm.interestRate),
        tenureMonths: Number(rdForm.tenureMonths),
      });
      setRdResult(res.data);
    } catch (err) {
      setRdError(err.response?.data?.message || "Could not open recurring deposit.");
    }
  };

  const closeFd = async (fdId) => { await FixedDepositApi.close(fdId); loadDeposits(); };
  const closeRd = async (rdId) => { await RecurringDepositApi.close(rdId); loadDeposits(); };

  return (
    <div>
      <h2>Deposits</h2>

      <div className="two-col">
        <div>
          <h3>Open Fixed Deposit</h3>
          <form className="form" onSubmit={openFd}>
            <label>Funding Account
              <input name="accountNumber" value={fdForm.accountNumber} onChange={handleFdChange} required />
            </label>
            <label>Principal Amount
              <input type="number" name="principalAmount" value={fdForm.principalAmount} onChange={handleFdChange} required />
            </label>
            <label>Interest Rate (% annual)
              <input type="number" step="0.01" name="interestRate" value={fdForm.interestRate} onChange={handleFdChange} required />
            </label>
            <label>Tenure (months)
              <input type="number" name="tenureMonths" value={fdForm.tenureMonths} onChange={handleFdChange} required />
            </label>
            <button type="submit">Open FD</button>
          </form>
          {fdError && <p className="hint error">{fdError}</p>}
          {fdResult && (
            <div className="result-card">
              FD #{fdResult.fdId} opened. Projected maturity: ₹{Number(fdResult.projectedMaturityAmount).toLocaleString()} on {fdResult.maturityDate}
            </div>
          )}
        </div>

        <div>
          <h3>Open Recurring Deposit</h3>
          <form className="form" onSubmit={openRd}>
            <label>Funding Account
              <input name="accountNumber" value={rdForm.accountNumber} onChange={handleRdChange} required />
            </label>
            <label>Monthly Installment
              <input type="number" name="monthlyInstallment" value={rdForm.monthlyInstallment} onChange={handleRdChange} required />
            </label>
            <label>Interest Rate (% annual)
              <input type="number" step="0.01" name="interestRate" value={rdForm.interestRate} onChange={handleRdChange} required />
            </label>
            <label>Tenure (months)
              <input type="number" name="tenureMonths" value={rdForm.tenureMonths} onChange={handleRdChange} required />
            </label>
            <button type="submit">Open RD</button>
          </form>
          {rdError && <p className="hint error">{rdError}</p>}
          {rdResult && (
            <div className="result-card">RD #{rdResult.rdId} opened, matures {rdResult.maturityDate}</div>
          )}
        </div>
      </div>

      <h3>View Deposits by Account</h3>
      <form className="form form-inline" onSubmit={loadDeposits}>
        <label>Account Number
          <input value={lookupAccount} onChange={(e) => setLookupAccount(e.target.value)} required />
        </label>
        <button type="submit">Load</button>
      </form>
      {lookupError && <p className="hint error">{lookupError}</p>}

      {fdList.length > 0 && (
        <>
          <h4>Fixed Deposits</h4>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Principal</th><th>Maturity Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {fdList.map((fd) => (
                <tr key={fd.fdId}>
                  <td>{fd.fdId}</td><td>{fd.principalAmount}</td><td>{fd.maturityDate}</td><td>{fd.status}</td>
                  <td>{fd.status === "ACTIVE" && <button onClick={() => closeFd(fd.fdId)}>Close</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {rdList.length > 0 && (
        <>
          <h4>Recurring Deposits</h4>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Installment</th><th>Maturity Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rdList.map((rd) => (
                <tr key={rd.rdId}>
                  <td>{rd.rdId}</td><td>{rd.monthlyInstallment}</td><td>{rd.maturityDate}</td><td>{rd.status}</td>
                  <td>{rd.status === "ACTIVE" && <button onClick={() => closeRd(rd.rdId)}>Close</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}