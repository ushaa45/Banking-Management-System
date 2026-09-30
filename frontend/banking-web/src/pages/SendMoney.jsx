import { useState } from "react";
import { TransactionApi } from "../api/api";

export default function SendMoney() {
  const [form, setForm] = useState({
    fromAccountNumber: "",
    toAccountNumber: "",
    amount: "",
    remarks: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await TransactionApi.transfer({ ...form, amount: Number(form.amount) });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed.");
    }
  };

  return (
    <div>
      <h2>Send Money</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          From Account
          <input name="fromAccountNumber" value={form.fromAccountNumber} onChange={handleChange} required />
        </label>
        <label>
          To Account
          <input name="toAccountNumber" value={form.toAccountNumber} onChange={handleChange} required />
        </label>
        <label>
          Amount
          <input type="number" name="amount" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
        </label>
        <label>
          Remarks
          <input name="remarks" value={form.remarks} onChange={handleChange} />
        </label>
        <button type="submit">Transfer</button>
      </form>

      {error && <p className="hint error">{error}</p>}
      {result && (
        <div className="result-card">
          Transfer {result.transactionStatus}: {result.transactionReference}
        </div>
      )}
    </div>
  );
}
