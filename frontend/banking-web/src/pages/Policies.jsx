import { useState } from "react";
import { Link } from "react-router-dom";
import { PolicyApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";

export default function Policies() {
  const [form, setForm] = useState({
    customerId: "", policyType: "LIFE", productName: "", sumAssured: "",
    premiumAmount: "", premiumFrequency: "MONTHLY", premiumAccountNumber: "",
    nomineeName: "", nomineeRelationship: "", policyTermYears: "",
  });
  const [issueResult, setIssueResult] = useState(null);
  const [issueError, setIssueError] = useState(null);

  const [lookupCustomer, setLookupCustomer] = useState("");
  const [policies, setPolicies] = useState([]);
  const [lookupError, setLookupError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssueError(null);
    setIssueResult(null);
    try {
      const res = await PolicyApi.issue({
        ...form,
        sumAssured: Number(form.sumAssured),
        premiumAmount: Number(form.premiumAmount),
        policyTermYears: Number(form.policyTermYears),
      });
      setIssueResult(res.data);
    } catch (err) {
      setIssueError(err.response?.data?.message || "Could not issue policy.");
    }
  };

  const loadPolicies = async (e) => {
    e.preventDefault();
    setLookupError(null);
    try {
      const res = await PolicyApi.getByCustomer(lookupCustomer);
      setPolicies(res.data);
    } catch {
      setLookupError("Could not load policies for this customer.");
    }
  };

  return (
    <div>
      <h2>Policies</h2>

      <h3>Issue Policy</h3>
      <form className="form" onSubmit={handleIssue}>
        <label>Customer ID
          <input name="customerId" value={form.customerId} onChange={handleChange} required />
        </label>
        <label>Policy Type
          <select name="policyType" value={form.policyType} onChange={handleChange}>
            <option value="LIFE">Life</option>
            <option value="HEALTH">Health</option>
            <option value="GENERAL">General</option>
          </select>
        </label>
        <label>Product Name
          <input name="productName" value={form.productName} onChange={handleChange} required placeholder="e.g. SecureLife Term Plan" />
        </label>
        <label>Sum Assured
          <input type="number" name="sumAssured" value={form.sumAssured} onChange={handleChange} required />
        </label>
        <label>Premium Amount
          <input type="number" name="premiumAmount" value={form.premiumAmount} onChange={handleChange} required />
        </label>
        <label>Premium Frequency
          <select name="premiumFrequency" value={form.premiumFrequency} onChange={handleChange}>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="ANNUALLY">Annually</option>
          </select>
        </label>
        <label>Premium Account
          <input name="premiumAccountNumber" value={form.premiumAccountNumber} onChange={handleChange} required />
        </label>
        <label>Nominee Name (optional)
          <input name="nomineeName" value={form.nomineeName} onChange={handleChange} />
        </label>
        <label>Nominee Relationship (optional)
          <input name="nomineeRelationship" value={form.nomineeRelationship} onChange={handleChange} />
        </label>
        <label>Policy Term (years)
          <input type="number" name="policyTermYears" value={form.policyTermYears} onChange={handleChange} required />
        </label>
        <button type="submit">Issue Policy</button>
      </form>
      {issueError && <p className="hint error">{issueError}</p>}
      {issueResult && (
        <div className="result-card">
          Policy {issueResult.policyNumber} issued, valid until {issueResult.endDate}.
        </div>
      )}

      <h3>View Policies by Customer</h3>
      <form className="form form-inline" onSubmit={loadPolicies}>
        <label>Customer ID
          <input value={lookupCustomer} onChange={(e) => setLookupCustomer(e.target.value)} required />
        </label>
        <button type="submit">Load</button>
      </form>
      {lookupError && <p className="hint error">{lookupError}</p>}

      <table className="data-table">
        <thead>
          <tr><th>Policy #</th><th>Type</th><th>Product</th><th>Sum Assured</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.policyId}>
              <td>{p.policyNumber}</td>
              <td>{p.policyType}</td>
              <td>{p.productName}</td>
              <td>{p.sumAssured}</td>
              <td><StatusBadge status={p.status}/></td>
              <td><Link to={`/claims?policyId=${p.policyId}`}>File/View Claims</Link></td>
              <td>
                <Link to={`/policies/${p.policyId}`}>View</Link>
                {" · "}
                <Link to={`/claims?policyId=${p.policyId}`}>File Claim</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}