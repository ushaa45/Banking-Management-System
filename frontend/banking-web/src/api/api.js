import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bank_jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a token expires/is invalid, the backend returns 401 - bounce to login
// rather than leaving the UI stuck showing failed requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (
      status === 401  &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("bank_jwt");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const AuthApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
};

export const CustomerApi = {
  list: () => api.get("/customers"),

  get: (id) => api.get(`/customers/${id}`),

  create: (payload) => api.post("/customers", payload),

  update: (id, payload) =>
    api.put(`/customers/${id}`, payload),

  // =========================
  // KYC
  // =========================

  getKyc: (customerId) =>
    api.get(`/customers/${customerId}/kyc`),

  submitKyc: (customerId, payload) =>
    api.post(
      `/customers/${customerId}/kyc/submit`,
      payload
    ),

  verifyKyc: (customerId) =>
    api.post(`/customers/${customerId}/kyc/verify`),

  rejectKyc: (customerId, reason) =>
    api.post(
      `/customers/${customerId}/kyc/reject`,
      null,
      {
        params: { reason },
      }
    ),
};

export const AccountApi = {
  get: (accountNumber) => api.get(`/accounts/${accountNumber}`),
  listForCustomer: (customerId) => api.get(`/customers/${customerId}/accounts`),
  open: (payload) => api.post("/accounts", payload),
  freeze: (accountNumber) => api.post(`/accounts/${accountNumber}/freeze`),
  close: (accountNumber) => api.post(`/accounts/${accountNumber}/close`),
};

export const TransactionApi = {
  deposit: (payload) => api.post("/transactions/deposit", payload),
  withdraw: (payload) => api.post("/transactions/withdraw", payload),
  transfer: (payload) => api.post("/transactions/transfer", payload),
  history: (accountNumber) => api.get(`/transactions/history/${accountNumber}`),
};

export const LoanApi = {
  apply: (payload) => api.post("/loans/apply", payload),
  getById: (loanId) => api.get(`/loans/${loanId}`),
  getByCustomer: (customerId) => api.get(`/loans/customer/${customerId}`),
  getEmis: (loanId) => api.get(`/loans/${loanId}/emis`),
  kycVerify: (loanId) => api.post(`/loans/${loanId}/kyc-verify`),
  creditEvaluate: (loanId) => api.post(`/loans/${loanId}/credit-evaluate`),
  approve: (loanId) => api.post(`/loans/${loanId}/approve`),
  sanction: (loanId) => api.post(`/loans/${loanId}/sanction`),
  disburse: (loanId, payload) => api.post(`/loans/${loanId}/disburse`, payload),
  reject: (loanId) => api.post(`/loans/${loanId}/reject`),
  payEmi: (emiId, payload) => api.post(`/loans/emis/${emiId}/pay`, payload),
};

export const FixedDepositApi = {
  open: (payload) => api.post("/fixed-deposits", payload),
  getById: (fdId) => api.get(`/fixed-deposits/${fdId}`),
  getByAccount: (accountNumber) => api.get(`/fixed-deposits/account/${accountNumber}`),
  close: (fdId) => api.post(`/fixed-deposits/${fdId}/close`),
};

export const RecurringDepositApi = {
  open: (payload) => api.post("/recurring-deposits", payload),
  getById: (rdId) => api.get(`/recurring-deposits/${rdId}`),
  getByAccount: (accountNumber) => api.get(`/recurring-deposits/account/${accountNumber}`),
  close: (rdId) => api.post(`/recurring-deposits/${rdId}/close`),
};

export const PolicyApi = {
  issue: (payload) => api.post("/policies", payload),
  getById: (policyId) => api.get(`/policies/${policyId}`),
  getByCustomer: (customerId) => api.get(`/policies/customer/${customerId}`),
  cancel: (policyId) => api.post(`/policies/${policyId}/cancel`),
  getPremiumHistory: (policyId) => api.get(`/policies/${policyId}/premium-history`),
};

export const ClaimApi = {
  file: (payload) => api.post("/claims/file", payload),
  getById: (claimId) => api.get(`/claims/${claimId}`),
  getByPolicy: (policyId) => api.get(`/claims/policy/${policyId}`),
  getByCustomer: (customerId) => api.get(`/claims/customer/${customerId}`),
  review: (claimId) => api.post(`/claims/${claimId}/review`),
  approve: (claimId, payload) => api.post(`/claims/${claimId}/approve`, payload),
  reject: (claimId, payload) => api.post(`/claims/${claimId}/reject`, payload),
  settle: (claimId, payload) => api.post(`/claims/${claimId}/settle`, payload),
};

export const AdminApi = {
  collectPremiums: () => api.post("/admin/jobs/collect-premiums"),
};

export default api;