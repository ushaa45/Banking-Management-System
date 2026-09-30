import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import Kyc from "../components/Kyc";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "" });
  const [createError, setCreateError] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ========================================================= 
  // SELECTED CUSTOMER FOR KYC 
  // ========================================================= 
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ========================================================= 
  // LOAD CUSTOMERS 
  // =========================================================

  const load = async () => {
  setLoadError(null);

  try {
    const res = await CustomerApi.list();
    setCustomers(res.data);
  } catch (err) {
    console.error("Failed to load customers:", err);
    setLoadError(
      err.response?.data?.message ||
      "Could not load customers."
    );
  }
};

  useEffect(() => { load(); }, []);

  // ========================================================= 
  // FORM 
  // =========================================================

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  //Create Customer

  const handleCreate = async (e) => {
    e.preventDefault();

    setCreateError(null);
    setCreateResult(null);

    try {
      const res = await CustomerApi.create(form);
      setCreateResult(res.data);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: ""
      });

      setShowForm(false);

      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Could not create customer.");
    }
  };

  // ========================================================= 
  // OPEN KYC 
  // =========================================================

  const handleKyc = (customer) => {
    setSelectedCustomer(customer);

    //Scroll to KYS section
    setTimeout(() => {
      document
        .getElementById("kyc-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    }, 100);
  };

  // ========================================================= 
  // CLOSE KYC 
  // ========================================================= 
  const closeKyc = () => {
    setSelectedCustomer(null);
  };

  // ========================================================= 
  // UI 
  // =========================================================

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customers</h2>

          <p className="hint">
            Manage customers and KYC verification.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "New Customer"}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleCreate}>
          <label>First Name
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>Last Name
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label>Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>Phone
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>Date of Birth
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </label>
          <button type="submit">Create Customer</button>
        </form>
      )}
      {createError && <p className="hint error">{createError}</p>}
      {createResult && (
        <div className="result-card">
          Created {createResult.firstName} {createResult.lastName} (ID {createResult.customerId}).{" "}
          <Link to={`/customers/${createResult.customerId}`}>View profile</Link>
        </div>
      )}

      {loadError && <p className="hint error">{loadError}</p>}

      {/* ===================================================== 
            CUSTOMER TABLE 
      ====================================================== */}

      {customers.length === 0 && !loadError ? (
        <p className="empty-state">No customers yet. Create the first one above.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>KYC</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customerId}>
                <td>{c.customerId}</td>
                <td><Link to={`/customers/${c.customerId}`}>{c.firstName} {c.lastName}</Link></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td><StatusBadge status={c.kycStatus} /></td>
                <td><StatusBadge status={c.status} /></td>
                {/* KYC BUTTON */}

                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleKyc(c)}
                  >
                    Manage KYC
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===================================================== 
                  KYC SECTION 
  ====================================================== */}
      {selectedCustomer && (
        <div
          id="kyc-section"
          className="mt-8" >

          {/* KYC HEADER */}
          <div
            className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                KYC Verification
              </h2>
              <p className="text-sm text-gray-500">
                Customer:{" "}
                <strong>
                  {selectedCustomer.firstName}{" "}
                  {selectedCustomer.lastName}
                </strong>
                {" "}— ID{" "}
                {selectedCustomer.customerId}
              </p>
            </div>

            <button type="button"
              onClick={closeKyc}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" >
              Close
            </button>
          </div>
          {/* KYC COMPONENT */}
          <Kyc customerId={selectedCustomer.customerId} />
        </div>
      )}
    </div>
  );
}