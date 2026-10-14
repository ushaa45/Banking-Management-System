import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
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
import BankingServices from "./pages/BankingServices.jsx";
import Accounts from "./pages/Accounts.jsx";
import NetBanking from "./pages/NetBanking.jsx";
import Register from "./pages/Register.jsx";
import OpenAccounts from "./pages/OpenAccounts.jsx";
import SavingsAccount from "./pages/SavingsAccount.jsx";
import CurrentAccountApply from "./pages/CurrentAccountApply.jsx";
import CreditCardApply from "./pages/CreditCardApply.jsx";

import HealthInsurance from "./pages/HealthInsurance.jsx";
import LifeInsurance from "./pages/LifeInsurance.jsx";

import HomeLoanApply from "./pages/HomeLoanApply.jsx";
import PersonalLoan from "./pages/PersonalLoan.jsx";
import CarLoan from "./pages/CarLoan.jsx";
import GoldLoan from "./pages/GoldLoan.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/netbanking" element={<NetBanking />} />
          <Route path="/login" element={<NetBanking />} />
          <Route path="/register" element={<Register />} />
          <Route path="/open-accounts" element={<OpenAccounts />} />
          <Route path="/savings-account" element={<SavingsAccount />} />
          <Route path="/apply-credit-card" element={<CreditCardApply />} />
          <Route path="/apply-current-account" element={<CurrentAccountApply />} />

          <Route path="/health-insurance" element={<HealthInsurance />} />
          <Route path="/life-insurance" element={<LifeInsurance />} />

          <Route path="/home-loans" element={<HomeLoanApply />} />
          <Route path="/personal-loan" element={<PersonalLoan />} />
          <Route path="/car-loan" element={<CarLoan />} />
          <Route path="/gold-loan" element={<GoldLoan />} />

          <Route path="/banking-services" element={<BankingServices />} />

          {/* Admin creates a user: outside the /app shell, roles enforced */}
          <Route element={<ProtectedRoute requiredRoles={["SUPER_ADMIN", "BANK_ADMIN"]} />}>
            <Route path="/admin/register" element={<Register admin />} />
          </Route>

          {/* Protected banking application */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<App />}>
              <Route index element={<Dashboard />} />

              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/:customerId" element={<CustomerDetail />} />
              <Route path="accounts" element={<Accounts />} />
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