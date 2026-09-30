import { useState } from "react";
import { Link } from "react-router-dom";
import { LoanApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";

export default function Loans() {
  const [customerId, setCustomerId] = useState("");
  const [loans, setLoans] = useState([]);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState({
    customerId: "",
    loanType: "PERSONAL",
    principalAmount: "",
    interestRate: "",
    tenureMonths: "",
  });
  const [applyResult, setApplyResult] = useState(null);
  const [applyError, setApplyError] = useState(null);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError(null);
    setApplyResult(null);
    try {
      const res = await LoanApi.apply({
        ...form,
        principalAmount: Number(form.principalAmount),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
      });
      setApplyResult(res.data);
    } catch (err) {
      setApplyError(err.response?.data?.message || "Loan application failed.");
    }
  };

  const loadLoans = async (e) => {
    e.preventDefault();
    setListError(null);
    try {
      const res = await LoanApi.getByCustomer(customerId);
      setLoans(res.data);
    } catch {
      setListError("Could not load loans for this customer.");
    }
  };

  return (
    <div>
      <h2>Loans</h2>

      <h3>Apply for a Loan</h3>
      <form className="form" onSubmit={handleApply}>
        <label>Customer ID
          <input name="customerId" value={form.customerId} onChange={handleFormChange} required />
        </label>
        <label>Loan Type
          <select name="loanType" value={form.loanType} onChange={handleFormChange}>
            <option value="PERSONAL">Personal</option>
            <option value="HOME">Home</option>
            <option value="EDUCATION">Education</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="BUSINESS">Business</option>
          </select>
        </label>
        <label>Principal Amount
          <input type="number" name="principalAmount" value={form.principalAmount} onChange={handleFormChange} required />
        </label>
        <label>Interest Rate (% annual)
          <input type="number" step="0.01" name="interestRate" value={form.interestRate} onChange={handleFormChange} required />
        </label>
        <label>Tenure (months)
          <input type="number" name="tenureMonths" value={form.tenureMonths} onChange={handleFormChange} required />
        </label>
        <button type="submit">Apply</button>
      </form>
      {applyError && <p className="hint error">{applyError}</p>}
      {applyResult && (
        <div className="result-card">
          Loan #{applyResult.loanId} created, status: {applyResult.status}.{" "}
          <Link to={`/loans/${applyResult.loanId}`}>View details</Link>
        </div>
      )}

      <h3>View Loans by Customer</h3>
      <form className="form form-inline" onSubmit={loadLoans}>
        <label>Customer ID
          <input value={customerId} onChange={(e) => setCustomerId(e.target.value)} required />
        </label>
        <button type="submit">Load</button>
      </form>
      {listError && <p className="hint error">{listError}</p>}

      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Type</th><th>Principal</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {loans.map((l) => (
            <tr key={l.loanId}>
              <td>{l.loanId}</td>
              <td>{l.loanType}</td>
              <td>{l.principalAmount}</td>
              <td><StatusBadge status={l.status} /></td>
              <td><Link to={`/loans/${l.loanId}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}