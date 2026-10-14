import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountApi } from "../api/api";
import StatusBadge from "../components/StatusBadge";

export default function Accounts() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    AccountApi.list()
      .then((res) => {
        const data = res.data;
        // supports a plain array or a paged response like { content: [...] }
        setAccounts(Array.isArray(data) ? data : data?.content ?? []);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load accounts.")
      )
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(
    () => ["ALL", ...new Set(accounts.map((a) => a.status).filter(Boolean))],
    [accounts]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      const matchesStatus = status === "ALL" || a.status === status;
      const matchesQuery =
        !q ||
        String(a.accountNumber).toLowerCase().includes(q) ||
        String(a.accountType ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [accounts, query, status]);

  const open = (accountNumber) => navigate(`/app/accounts/${accountNumber}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="hint error">{error}</p>;

  return (
    <div>
      <h2>Accounts</h2>
      <p className="eyebrow-line">
        {visible.length} of {accounts.length} accounts
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <input
          type="search"
          placeholder="Search by account number or type"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search accounts"
          style={{ flex: "1 1 260px", maxWidth: 360 }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">No accounts found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr
                key={a.accountNumber}
                onClick={() => open(a.accountNumber)}
                style={{ cursor: "pointer" }}
              >
                <td>{a.accountNumber}</td>
                <td>{a.accountType}</td>
                <td>
                  {a.currency} {Number(a.balance).toLocaleString()}
                </td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      open(a.accountNumber);
                    }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}