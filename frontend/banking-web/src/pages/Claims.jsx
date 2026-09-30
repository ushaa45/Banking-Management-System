import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ClaimApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";

export default function Claims() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    policyId: searchParams.get("policyId") || "",
    claimAmount: "",
    reason: "",
  });
  const [fileResult, setFileResult] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [lookupPolicy, setLookupPolicy] = useState(searchParams.get("policyId") || "");
  const [claims, setClaims] = useState([]);
  const [lookupError, setLookupError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = async (e) => {
    e.preventDefault();
    setFileError(null);
    setFileResult(null);
    try {
      const res = await ClaimApi.file({ ...form, claimAmount: Number(form.claimAmount) });
      setFileResult(res.data);
    } catch (err) {
      setFileError(err.response?.data?.message || "Could not file claim.");
    }
  };

  const loadClaims = async (e) => {
    e?.preventDefault();
    setLookupError(null);
    try {
      const res = await ClaimApi.getByPolicy(lookupPolicy);
      setClaims(res.data);
    } catch {
      setLookupError("Could not load claims for this policy.");
    }
  };

  return (
    <div>
      <h2>Claims</h2>

      <h3>File a Claim</h3>
      <form className="form" onSubmit={handleFile}>
        <label>Policy ID
          <input name="policyId" value={form.policyId} onChange={handleChange} required />
        </label>
        <label>Claim Amount
          <input type="number" name="claimAmount" value={form.claimAmount} onChange={handleChange} required />
        </label>
        <label>Reason
          <input name="reason" value={form.reason} onChange={handleChange} />
        </label>
        <button type="submit">File Claim</button>
      </form>
      {fileError && <p className="hint error">{fileError}</p>}
      {fileResult && (
        <div className="result-card">
          Claim {fileResult.claimReference} filed, status: {fileResult.status}.{" "}
          <Link to={`/claims/${fileResult.claimId}`}>View details</Link>
        </div>
      )}

      <h3>View Claims by Policy</h3>
      <form className="form form-inline" onSubmit={loadClaims}>
        <label>Policy ID
          <input value={lookupPolicy} onChange={(e) => setLookupPolicy(e.target.value)} required />
        </label>
        <button type="submit">Load</button>
      </form>
      {lookupError && <p className="hint error">{lookupError}</p>}

      <table className="data-table">
        <thead>
          <tr><th>Reference</th><th>Amount</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.claimId}>
              <td>{c.claimReference}</td>
              <td>{c.claimAmount}</td>
              <td><StatusBadge status={c.status}/></td>
              <td><Link to={`/claims/${c.claimId}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}