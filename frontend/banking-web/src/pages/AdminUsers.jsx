import { useState } from "react";
import { AuthApi } from "../api/api";

const ALL_ROLES = ["SUPER_ADMIN", "BANK_ADMIN", "BRANCH_MANAGER", "BANK_EMPLOYEE", "TELLER", "CUSTOMER", "AUDITOR"];

export default function AdminUsers() {
  const [form, setForm] = useState({ username: "", password: "", employeeCode: "", customerId: "" });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleRole = (role) =>
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (selectedRoles.length === 0) {
      setError("Select at least one role.");
      return;
    }
    try {
      const payload = { username: form.username, password: form.password, roles: selectedRoles };
      if (form.employeeCode) payload.employeeCode = form.employeeCode;
      if (form.customerId) payload.customerId = Number(form.customerId);

      const res = await AuthApi.register(payload);
      setResult(res.data);
      setForm({ username: "", password: "", employeeCode: "", customerId: "" });
      setSelectedRoles([]);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create user.");
    }
  };

  return (
    <div>
      <h2>Create User</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Username
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>
        <label>Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
        </label>
        <label>Employee Code (optional)
          <input name="employeeCode" value={form.employeeCode} onChange={handleChange} />
        </label>
        <label>Customer ID (optional, links to a customer)
          <input name="customerId" value={form.customerId} onChange={handleChange} />
        </label>

        <fieldset className="role-picker">
          <legend>Roles</legend>
          {ALL_ROLES.map((role) => (
            <label key={role} className="checkbox-label">
              <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)} />
              {role}
            </label>
          ))}
        </fieldset>

        <button type="submit">Create User</button>
      </form>
      {error && <p className="hint error">{error}</p>}
      {result && (
        <div className="result-card">
          User "{result.username}" created with roles: {result.roles.join(", ")}
        </div>
      )}
    </div>
  );
}