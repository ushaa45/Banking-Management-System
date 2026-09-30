import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CustomerList from "./pages/CustomerList.jsx";
import CustomerDetail from "./pages/CustomerDetail.jsx";
import AccountDetails from "./pages/AccountDetails.jsx";
import SendMoney from "./pages/SendMoney.jsx";
import Loans from "./pages/Loans.jsx";
import LoanDetail from "./pages/LoanDetail.jsx";
import Deposits from "./pages/Deposits.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import Policies from "./pages/Policies.jsx";
import PolicyDetail from "./pages/PolicyDetail.jsx";
import Claims from "./pages/Claims.jsx";
import ClaimDetail from "./pages/ClaimDetail.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<App />}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/:customerId" element={<CustomerDetail />} />
              <Route path="accounts/:accountNumber" element={<AccountDetails />} />
              <Route path="send-money" element={<SendMoney />} />
              <Route path="loans" element={<Loans />} />
              <Route path="loans/:loanId" element={<LoanDetail />} />
              <Route path="deposits" element={<Deposits />} />
              <Route path="policies" element={<Policies />} />
              <Route path="policies/:policyId" element={<PolicyDetail />} />
              <Route path="claims" element={<Claims />} />
              <Route path="claims/:claimId" element={<ClaimDetail />} />

              <Route element={<ProtectedRoute requiredRoles={["SUPER_ADMIN", "BANK_ADMIN"]} />}>
                <Route path="admin/users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);