import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import loanApi from "../api/loanApi";

const initialForm = {
  customerId: "",
  loanType: "PERSONAL",
  principalAmount: "",
  tenureMonths: "",
};

const statusStyles = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  KYC_VERIFIED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  CREDIT_EVALUATED: "bg-purple-50 text-purple-700 border-purple-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SANCTIONED: "bg-amber-50 text-amber-700 border-amber-200",
  DISBURSED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-300",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const workflow = [
  {
    number: 1,
    status: "APPLIED",
    label: "Applied",
    description: "Application submitted",
  },
  {
    number: 2,
    status: "KYC_VERIFIED",
    label: "KYC Verified",
    description: "Identity verified",
  },
  {
    number: 3,
    status: "CREDIT_EVALUATED",
    label: "Credit Evaluated",
    description: "Credit assessment",
  },
  {
    number: 4,
    status: "APPROVED",
    label: "Approved",
    description: "Loan approved",
  },
  {
    number: 5,
    status: "SANCTIONED",
    label: "Sanctioned",
    description: "Loan sanctioned",
  },
  {
    number: 6,
    status: "DISBURSED",
    label: "Disbursed",
    description: "Amount released",
  },
  {
    number: 7,
    status: "ACTIVE",
    label: "Active",
    description: "EMIs started",
  },
];

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Loans() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loans, setLoans] = useState([]);

  const [hasLoadedLoans, setHasLoadedLoans] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ADD THIS CODE BELOW YOUR STATE DECLARATIONS 
  const summary = useMemo(() => ({
    total: loans.length,
    active: loans.filter((loan) => loan.status === "ACTIVE"
    ).length,

    pending: loans.filter(
      (loan) =>
        !["ACTIVE", "CLOSED", "REJECTED"].includes(loan.status)
    ).length, principal: loans.reduce(
      (sum, loan) =>
        sum + Number(loan.principalAmount || 0),
      0),
  }),
    [loans]);

  const estimatedEmi = useMemo(() => {
    const principal = Number(form.principalAmount);
    const months = Number(form.tenureMonths);

    if (!principal || principal < 1000 || !months) return null;

    // Indicative estimate at 10% annual interest.
    const monthlyRate = 0.10 / 12;
    const factor = Math.pow(1 + monthlyRate, months);

    return (
      (principal * monthlyRate * factor) /
      (factor - 1)
    );
  }, [form.principalAmount, form.tenureMonths]);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const loadCustomerLoans = async () => {
    if (!form.customerId) {
      setError("Please enter a customer ID.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoadingLoans(true);

      const data = await loanApi.getByCustomer(form.customerId);

      setLoans(Array.isArray(data) ? data : []);
      setHasLoadedLoans(true);
    } catch (err) {
      console.error(err);

      setLoans([]);
      setHasLoadedLoans(false);

      setError(
        err.response?.data?.message ||
        "Unable to load customer loans."
      );
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const payload = {
        customerId: Number(form.customerId),
        loanType: form.loanType,
        principalAmount: Number(form.principalAmount),
        tenureMonths: Number(form.tenureMonths),
      };

      const createdLoan = await loanApi.apply(payload);

      setSuccess(
        `Loan #${createdLoan.loanId} has been successfully submitted.`
      );

      setForm({
        ...initialForm,
        customerId: String(createdLoan.customerId || form.customerId),
      });

      if (createdLoan.customerId) {
        const data = await loanApi.getByCustomer(
          createdLoan.customerId
        );

        setLoans(Array.isArray(data) ? data : []);
        setHasLoadedLoans(true);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to submit loan application."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    return workflow.findIndex(
      (step) => step.status === status
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Banking
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Loans
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Apply for loans, track approval status and manage
                your EMI payments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Loan Workflow
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                Application → Approval → EMI
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================

        =====================================================*/}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Loans",
              value: hasLoadedLoans ? summary.total : "—",
              icon: "▤",
            },
            {
              label: "Active Loans",
              value: hasLoadedLoans ? summary.active : "—",
              icon: "↗",
            },
            {
              label: "Applications in Progress",
              value: hasLoadedLoans ? summary.pending : "—",
              icon: "◷",
            },
            {
              label: "Total Principal",
              value: hasLoadedLoans
                ? formatMoney(summary.principal)
                : "—",
              icon: "₹",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                  {item.icon}
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>


        {/* =====================================================
            ALERTS
        ====================================================== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="mt-0.5 font-bold">!</span>

            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            <span className="mt-0.5 font-bold">✓</span>

            <p>{success}</p>
          </div>
        )}

        {/* =====================================================
            TOP GRID
        ====================================================== */}
        <div className="grid gap-6 xl:grid-cols-3">

          {/* ===================================================
              APPLY FOR LOAN
          ==================================================== */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                💳
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Apply for Loan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Submit a new loan application.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleApply}
              className="grid gap-5 md:grid-cols-2"
            >

              {/* CUSTOMER ID */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer ID
                </label>

                <input
                  type="number"
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Enter customer ID"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* LOAN TYPE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Loan Type
                </label>

                <select
                  name="loanType"
                  value={form.loanType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="PERSONAL">
                    Personal Loan
                  </option>

                  <option value="HOME">
                    Home Loan
                  </option>

                  <option value="EDUCATION">
                    Education Loan
                  </option>

                  <option value="VEHICLE">
                    Vehicle Loan
                  </option>

                  <option value="BUSINESS">
                    Business Loan
                  </option>
                </select>
              </div>

              {/* LOAN AMOUNT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Loan Amount
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="principalAmount"
                    value={form.principalAmount}
                    onChange={handleChange}
                    required
                    min="1000"
                    step="0.01"
                    placeholder="Enter loan amount"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* TENURE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tenure
                </label>

                <select
                  name="tenureMonths"
                  value={form.tenureMonths}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select tenure
                  </option>

                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                  <option value="48">48 Months</option>
                  <option value="60">60 Months</option>
                </select>
              </div>

              {/* SUBMIT */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Submitting Application..."
                    : "Apply for Loan"}
                </button>
              </div>
            </form>
          </div>

          {/* ===================================================
              QUICK INFO
          ==================================================== */}
          {/*<div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-blue-300">
              Loan Information
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Manage your borrowing journey
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Submit an application and follow every stage from
              KYC verification through approval, disbursement and
              EMI repayment.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Application
                </p>

                <p className="mt-1 font-semibold">
                  Simple digital application
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Tracking
                </p>

                <p className="mt-1 font-semibold">
                  Real-time loan status
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Repayment
                </p>

                <p className="mt-1 font-semibold">
                  EMI schedule and payments
                </p>
              </div>
            </div>
          </div> */}

          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-blue-300">
              LOAN CALCULATOR
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Plan your repayment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Estimate your monthly payment before applying.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                Estimated monthly EMI
              </p>

              <p className="mt-2 text-3xl font-bold">
                {estimatedEmi == null
                  ? "—"
                  : formatMoney(estimatedEmi)}
              </p>

              <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-slate-400">Illustrative rate</span>
                <span className="font-semibold">10% p.a.</span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-400">Tenure</span>
                <span className="font-semibold">
                  {form.tenureMonths
                    ? `${form.tenureMonths} months`
                    : "Not selected"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              This is an estimate, not a loan offer. Actual EMI depends
              on the final interest rate and loan terms.
            </p>
          </div>
        </div>

        {/* =====================================================
            CUSTOMER LOANS
        ====================================================== */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Customer Loans
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View all loans belonging to a customer.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                type="number"
                value={form.customerId}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    customerId: event.target.value,
                  }))
                }
                placeholder="Customer ID"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-52"
              />

              <button
                onClick={loadCustomerLoans}
                disabled={loadingLoans}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingLoans
                  ? "Loading..."
                  : "Load Loans"}
              </button>
            </div>
          </div>

          {/* LOAN LIST */}
          <div className="mt-6">

            {loans.length === 0 && !loadingLoans ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                  💳
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No loans loaded
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Enter a customer ID above and click
                  <span className="font-semibold text-slate-700">
                    {" "}Load Loans
                  </span>
                  {" "}to view the customer's loan accounts.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {loans.map((loan) => {
                  const currentIndex = getStatusIndex(
                    loan.status
                  );

                  return (
                    <div
                      key={loan.loanId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* LEFT */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900">
                              Loan #{loan.loanId}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[loan.status] ||
                                "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                            >
                              {loan.status}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {loan.loanType} · Customer #
                            {loan.customerId}
                          </p>
                        </div>

                        {/* STATS */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">

                          <div>
                            <p className="text-xs text-slate-400">
                              Principal
                            </p>

                            <p className="mt-1 font-bold text-slate-900">
                              {formatMoney(
                                loan.principalAmount
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Interest
                            </p>

                            <p className="mt-1 font-bold text-slate-900">
                              {loan.interestRate}%
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Tenure
                            </p>

                            <p className="mt-1 font-bold text-slate-900">
                              {loan.tenureMonths} months
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Applied
                            </p>

                            <p className="mt-1 font-semibold text-slate-700">
                              {formatDate(loan.appliedAt)}
                            </p>
                          </div>
                        </div>

                        {/* BUTTON */}
                        <button
                          onClick={() =>
                            navigate(`/loans/${loan.loanId}`)
                          }
                          className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          View Details →
                        </button>
                      </div>

                      {/* MINI PROGRESS */}
                      {loan.status !== "REJECTED" && (
                        <div className="mt-5 border-t border-slate-100 pt-5">
                          <div className="flex items-center gap-1">
                            {workflow.map((step, index) => {
                              const completed =
                                currentIndex >= index;

                              return (
                                <React.Fragment
                                  key={step.status}
                                >
                                  <div
                                    className={`h-1.5 flex-1 rounded-full ${completed
                                      ? "bg-blue-600"
                                      : "bg-slate-200"
                                      }`}
                                  />

                                  {index ===
                                    workflow.length - 1 && null}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
                            <span>Applied</span>
                            <span>Active</span>
                          </div>
                        </div>
                      )}

                      {loan.status === "REJECTED" && (
                        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                          This loan application has been rejected.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            LOAN PROCESS
        ====================================================== */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              Loan Process
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Follow the complete journey of a loan application.
            </p>
          </div>

          <div className="overflow-x-auto pb-3">
            <div className="flex min-w-[900px] items-start">

              {workflow.map((step, index) => (
                <React.Fragment key={step.status}>

                  <div className="relative flex flex-1 flex-col items-center text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-100">
                      {step.number}
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-800">
                      {step.label}
                    </h3>

                    <p className="mt-1 max-w-[120px] text-xs leading-5 text-slate-400">
                      {step.description}
                    </p>
                  </div>

                  {index < workflow.length - 1 && (
                    <div className="mt-6 h-1 flex-1 rounded-full bg-slate-200">
                      <div className="h-full w-full rounded-full bg-blue-100" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Loans;
