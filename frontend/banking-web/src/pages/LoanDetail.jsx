import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import loanApi from "../api/loanApi";

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

const timeline = [
  "APPLIED",
  "KYC_VERIFIED",
  "CREDIT_EVALUATED",
  "APPROVED",
  "SANCTIONED",
  "DISBURSED",
  "ACTIVE",
  "CLOSED",
];

const formatMoney = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function LoanDetail() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const loanData = await loanApi.getById(loanId);

      setLoan(loanData);

      if (
        loanData.status === "ACTIVE" ||
        loanData.status === "DISBURSED" ||
        loanData.status === "CLOSED"
      ) {
        const emiData = await loanApi.getEmis(loanId);

        setEmis(Array.isArray(emiData) ? emiData : []);
      } else {
        setEmis([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load loan details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loanId]);

  const executeAction = async (actionName, action) => {
    try {
      setActionLoading(actionName);
      setError("");
      setSuccess("");

      await action();

      setSuccess(
        `${actionName.replace("-", " ")} completed successfully.`
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        `Unable to perform ${actionName}.`
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDisbursement = async () => {
    if (!accountNumber.trim()) {
      setError("Please enter the destination account number.");
      return;
    }

    await executeAction("disbursement", () =>
      loanApi.disburse(loanId, {
        toAccountNumber: accountNumber.trim(),
      })
    );
  };

  const handlePayEmi = async (event) => {
    event.preventDefault();

    if (!selectedEmi) {
      return;
    }

    if (!paymentAccount.trim()) {
      setError("Please enter the payment account number.");
      return;
    }

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    try {
      setActionLoading("pay-emi");
      setError("");
      setSuccess("");

      await loanApi.payEmi(selectedEmi.emiId, {
        accountNumber: paymentAccount.trim(),
        paidAmount: Number(paymentAmount),
      });

      setSuccess(
        `EMI #${selectedEmi.emiNumber || selectedEmi.emiId} payment submitted successfully.`
      );

      setSelectedEmi(null);
      setPaymentAmount("");

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to process EMI payment."
      );
    } finally {
      setActionLoading("");
    }
  };

  const completedTimelineIndex = useMemo(() => {
    if (!loan?.status) return -1;

    if (loan.status === "REJECTED") {
      return -1;
    }

    return timeline.indexOf(loan.status);
  }, [loan]);

  const totalEmi = useMemo(() => {
    return emis.reduce(
      (total, emi) => total + Number(emi.emiAmount || 0),
      0
    );
  }, [emis]);

  const paidEmi = useMemo(() => {
    return emis.filter(
      (emi) => emi.status === "PAID"
    ).length;
  }, [emis]);

  const pendingEmi = emis.length - paidEmi;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading loan details...
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Loan not found
          </h2>

          <button
            onClick={() => navigate("/loans")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

  const canVerifyKyc = loan.status === "APPLIED";
  const canEvaluate = loan.status === "KYC_VERIFIED";
  const canApprove = loan.status === "CREDIT_EVALUATED";
  const canSanction = loan.status === "APPROVED";
  const canDisburse = loan.status === "SANCTIONED";
  const canReject =
    !["ACTIVE", "CLOSED", "REJECTED"].includes(loan.status);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => navigate("/loans")}
              className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Loans
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                Loan #{loan.loanId}
              </h1>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[loan.status] ||
                  "bg-slate-100 text-slate-700"
                  }`}
              >
                {loan.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Customer #{loan.customerId} · {loan.loanType}
            </p>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* STATUS TIMELINE */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Loan Status
          </h2>

          {loan.status === "REJECTED" ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              This loan application has been rejected.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="flex min-w-[750px] items-start">
                {timeline.map((step, index) => {
                  const completed =
                    index <= completedTimelineIndex;

                  const current =
                    index === completedTimelineIndex;

                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-1 flex-col items-center text-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${completed
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                            }`}
                        >
                          {completed ? "✓" : index + 1}
                        </div>

                        <p
                          className={`mt-2 text-xs font-semibold ${current
                            ? "text-blue-700"
                            : completed
                              ? "text-slate-700"
                              : "text-slate-400"
                            }`}
                        >
                          {step.replaceAll("_", " ")}
                        </p>
                      </div>

                      {index < timeline.length - 1 && (
                        <div
                          className={`mt-5 h-1 flex-1 rounded ${index < completedTimelineIndex
                            ? "bg-blue-600"
                            : "bg-slate-200"
                            }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LOAN SUMMARY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">
              Loan Summary
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Principal Amount
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatMoney(loan.principalAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Interest Rate
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {loan.interestRate}%
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Tenure
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {loan.tenureMonths} months
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Loan Type
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {loan.loanType}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Applied At
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {formatDateTime(loan.appliedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Disbursed At
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {formatDateTime(loan.disbursedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Actions
            </h2>

            <div className="mt-5 space-y-3">

              {canVerifyKyc && (
                <button
                  onClick={() =>
                    executeAction(
                      "kyc-verify",
                      () => loanApi.verifyKyc(loanId)
                    )
                  }
                  disabled={!!actionLoading}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {actionLoading === "kyc-verify"
                    ? "Verifying..."
                    : "Verify KYC"}
                </button>
              )}

              {canEvaluate && (
                <button
                  onClick={() =>
                    executeAction(
                      "credit-evaluate",
                      () => loanApi.evaluateCredit(loanId)
                    )
                  }
                  disabled={!!actionLoading}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                >
                  {actionLoading === "credit-evaluate"
                    ? "Evaluating..."
                    : "Evaluate Credit"}
                </button>
              )}

              {canApprove && (
                <button
                  onClick={() =>
                    executeAction(
                      "approve",
                      () => loanApi.approve(loanId)
                    )
                  }
                  disabled={!!actionLoading}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {actionLoading === "approve"
                    ? "Approving..."
                    : "Approve Loan"}
                </button>
              )}

              {canSanction && (
                <button
                  onClick={() =>
                    executeAction(
                      "sanction",
                      () => loanApi.sanction(loanId)
                    )
                  }
                  disabled={!!actionLoading}
                  className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {actionLoading === "sanction"
                    ? "Sanctioning..."
                    : "Sanction Loan"}
                </button>
              )}

              {canDisburse && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-3 text-xs font-semibold text-amber-800">
                    Destination Account
                  </p>

                  <input
                    value={accountNumber}
                    onChange={(event) =>
                      setAccountNumber(event.target.value)
                    }
                    placeholder="Enter account number"
                    className="mb-3 w-full rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  />

                  <button
                    onClick={handleDisbursement}
                    disabled={!!actionLoading}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {actionLoading === "disbursement"
                      ? "Disbursing..."
                      : "Disburse Loan"}
                  </button>
                </div>
              )}

              {canReject && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reject this loan?"
                      )
                    ) {
                      executeAction(
                        "reject",
                        () => loanApi.reject(loanId)
                      );
                    }
                  }}
                  disabled={!!actionLoading}
                  className="w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Reject Loan
                </button>
              )}

              {!canVerifyKyc &&
                !canEvaluate &&
                !canApprove &&
                !canSanction &&
                !canDisburse &&
                !canReject && (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                    No actions available for this loan status.
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* EMI SECTION */}
        {(loan.status === "ACTIVE" ||
          loan.status === "DISBURSED" ||
          loan.status === "CLOSED") && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    EMI Schedule
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track installments and make EMI payments.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="font-bold text-slate-900">
                      {emis.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                    <p className="text-xs text-green-600">
                      Paid
                    </p>

                    <p className="font-bold text-green-700">
                      {paidEmi}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                    <p className="text-xs text-amber-600">
                      Pending
                    </p>

                    <p className="font-bold text-amber-700">
                      {pendingEmi}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">
                        EMI
                      </th>

                      <th className="px-4 py-3">
                        Due Date
                      </th>

                      <th className="px-4 py-3">
                        EMI Amount
                      </th>

                      <th className="px-4 py-3">
                        Principal
                      </th>

                      <th className="px-4 py-3">
                        Interest
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {emis.map((emi, index) => {
                      const isPaid = emi.status === "PAID";

                      return (
                        <tr
                          key={emi.emiId}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 font-semibold text-slate-800">
                            #{emi.emiNumber || index + 1}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatDate(emi.dueDate)}
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {formatMoney(emi.emiAmount)}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatMoney(
                              emi.principalComponent
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatMoney(
                              emi.interestComponent
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${isPaid
                                ? "bg-green-100 text-green-700"
                                : emi.status === "OVERDUE"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {emi.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            {!isPaid ? (
                              <button
                                onClick={() => {
                                  setSelectedEmi(emi);
                                  setPaymentAmount(
                                    Number(
                                      emi.emiAmount || 0
                                    ).toFixed(2)
                                  );
                                }}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Pay EMI
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-green-600">
                                Paid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {emis.length === 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  No EMI schedule found.
                </div>
              )}

              {emis.length > 0 && (
                <div className="mt-5 flex justify-end">
                  <div className="rounded-xl bg-slate-900 px-5 py-3 text-right text-white">
                    <p className="text-xs text-slate-300">
                      Scheduled EMI Total
                    </p>

                    <p className="text-lg font-bold">
                      {formatMoney(totalEmi)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* PAYMENT MODAL */}
      {selectedEmi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Pay EMI
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  EMI #{selectedEmi.emiNumber || selectedEmi.emiId}
                </p>
              </div>

              <button
                onClick={() => setSelectedEmi(null)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePayEmi} className="space-y-5">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  EMI Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatMoney(selectedEmi.emiAmount)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Account Number
                </label>

                <input
                  value={paymentAccount}
                  onChange={(event) =>
                    setPaymentAccount(event.target.value)
                  }
                  required
                  placeholder="Enter account number"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Amount
                </label>

                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(event.target.value)
                  }
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEmi(null)}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading === "pay-emi"}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {actionLoading === "pay-emi"
                    ? "Processing..."
                    : "Pay Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanDetail;