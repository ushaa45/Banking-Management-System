import { useEffect, useState } from "react";
import { CustomerApi } from "../api/api";

function Kyc({ customerId }) {
    const [kyc, setKyc] = useState(null);

    const [documentType, setDocumentType] = useState("");
    const [documentNumber, setDocumentNumber] = useState("");

    const [rejectReason, setRejectReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [message, setMessage] = useState("");

    const [showRejectForm, setShowRejectForm] = useState(false);

    // =========================================================
    // LOAD KYC
    // =========================================================

    const loadKyc = async () => {
        try {
            setLoading(true); 
            setError(""); 
            setMessage("");

            const response = await CustomerApi.getKyc(customerId);

            const data = response.data;

            setKyc(data);

            // Populate form when KYC already exists
            if (data) {
                setDocumentType(data.documentType || "");
                setDocumentNumber(data.documentNumber || "");
            }

        } catch (err) {

            console.error("Failed to load KYC: ", err);

            // 404 means KYC has not been submitted yet
            if (err.response?.status === 404) {
                setKyc(null);
                setMessage("KYC has not been submitted yet.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load KYC information."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customerId) {
            loadKyc();
        }
    }, [customerId]);

    // =========================================================
    // SUBMIT / RESUBMIT KYC
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setMessage("");

        if (!documentType.trim()) {
            setError("Please select a document type.");
            return;
        }

        if (!documentNumber.trim()) {
            setError("Please enter the document number.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await CustomerApi.submitKyc(
                customerId,
                {
                    documentType: documentType.trim(),
                    documentNumber: documentNumber.trim(),
                }
            );

            const data = response.data;

            setKyc(data);

            setSuccess(
                "KYC submitted successfully and is now under review."
            );

        } catch (err) {

            console.error("Failed to submit KYC:", err);

            setError(
                err.response?.data?.message ||
                "Unable to submit KYC."
            );

        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // APPROVE KYC
    // =========================================================

    const handleApprove = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to approve this KYC?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const response = await CustomerApi.verifyKyc(customerId);

            const data = response.data;

            setKyc(data);

            setSuccess("KYC has been approved successfully.");

        } catch (err) {


            console.err("Failed to approve KYC: ",err);

            setError(
                err.response?.data?.message ||
                "Unable to approve KYC."
            );

        } finally {
            setProcessing(false);
        }
    };

    // =========================================================
    // REJECT KYC
    // =========================================================

    const handleReject = async () => {

        if (!rejectReason.trim()) {
            setError("Please provide a rejection reason.");
            return;
        }

        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const response = await CustomerApi.rejectKyc(
                customerId,
                rejectReason.trim()
            );

            const data = response.data;

            setKyc(data);

            setRejectReason("");
            setShowRejectForm(false);

            setSuccess("KYC has been rejected.");

        } catch (err) {

            console.error("Failed to Reject KYC: ",err);

            setError(
                err.response?.data?.message ||
                "Unable to reject KYC."
            );

        } finally {
            setProcessing(false);
        }
    };

    // =========================================================
    // STATUS BADGE
    // =========================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "VERIFIED":
                return "bg-green-100 text-green-700 border-green-200";

            case "UNDER_REVIEW":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";

            case "REJECTED":
                return "bg-red-100 text-red-700 border-red-200";

            case "PENDING":
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">
                    Loading KYC information...
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            {/* HEADER */}
            <div className="mb-5 flex items-center justify-between">

                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        KYC Verification
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Identity verification details
                    </p>
                </div>

                {kyc && (
                    <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                            kyc.status
                        )}`}
                    >
                        {kyc.status?.replace("_", " ")}
                    </span>
                )}

            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

    {/* =====================================================
          NO KYC / REJECTED
    ====================================================== */}

            {(!kyc || kyc.status === "REJECTED") && (

                <form onSubmit={handleSubmit}>

                    {kyc?.status === "REJECTED" && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">

                            <p className="text-sm font-semibold text-red-800">
                                KYC Rejected
                            </p>

                            {kyc.rejectionReason && (
                                <p className="mt-1 text-sm text-red-700">
                                    Reason: {kyc.rejectionReason}
                                </p>
                            )}

                            <p className="mt-2 text-xs text-red-600">
                                You can correct the information and submit KYC again.
                            </p>

                        </div>
                    )}

                    {/* DOCUMENT TYPE */}
                    <div className="mb-4">

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Document Type
                        </label>

                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">
                                Select document type
                            </option>

                            <option value="Aadhar">
                                Aadhaar
                            </option>

                            <option value="PAN">
                                PAN
                            </option>

                            <option value="Passport">
                                Passport
                            </option>

                            <option value="Driving License">
                                Driving License
                            </option>

                            <option value="Voter ID">
                                Voter ID
                            </option>
                        </select>

                    </div>

                    {/* DOCUMENT NUMBER */}
                    <div className="mb-5">

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Document Number
                        </label>

                        <input
                            type="text"
                            value={documentNumber}
                            onChange={(e) =>
                                setDocumentNumber(e.target.value)
                            }
                            placeholder="Enter document number"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting
                            ? "Submitting..."
                            : kyc?.status === "REJECTED"
                                ? "Resubmit KYC"
                                : "Submit KYC"}
                    </button>

                </form>
            )}

      {/* =====================================================
          UNDER REVIEW
      ====================================================== */}

            {kyc?.status === "UNDER_REVIEW" && (

                <div>

                    <div className="grid gap-4 md:grid-cols-2">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Document Type
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {kyc.documentType}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Document Number
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {kyc.documentNumber}
                            </p>
                        </div>

                    </div>

                    {kyc.submittedAt && (
                        <div className="mt-4">

                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Submitted At
                            </p>

                            <p className="mt-1 text-sm text-gray-700">
                                {new Date(kyc.submittedAt).toLocaleString()}
                            </p>

                        </div>
                    )}

                    {/* ADMIN ACTIONS */}
                    <div className="mt-6 border-t border-gray-200 pt-5">

                        <p className="mb-3 text-sm font-semibold text-gray-800">
                            Review KYC
                        </p>

                        {!showRejectForm && (
                            <div className="flex flex-wrap gap-3">

                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? "Processing..."
                                        : "Approve KYC"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setShowRejectForm(true);
                                    }}
                                    disabled={processing}
                                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Reject KYC
                                </button>

                            </div>
                        )}

                        {/* REJECTION FORM */}
                        {showRejectForm && (

                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">

                                <label className="mb-2 block text-sm font-medium text-red-900">
                                    Rejection Reason
                                </label>

                                <textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Enter reason for rejecting this KYC..."
                                    className="w-full rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                />

                                <div className="mt-3 flex gap-3">

                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={processing}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processing
                                            ? "Rejecting..."
                                            : "Confirm Rejection"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRejectForm(false);
                                            setRejectReason("");
                                            setError("");
                                        }}
                                        disabled={processing}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>
            )}

            {/* =====================================================
          VERIFIED
      ====================================================== */}

            {kyc?.status === "VERIFIED" && (

                <div>

                    <div className="grid gap-4 md:grid-cols-2">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Document Type
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {kyc.documentType}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Document Number
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {kyc.documentNumber}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Verified By
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {kyc.verifiedBy || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Verified At
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {kyc.verifiedAt
                                    ? new Date(kyc.verifiedAt).toLocaleString()
                                    : "-"}
                            </p>
                        </div>

                    </div>

                    <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">

                        <p className="text-sm font-semibold text-green-800">
                            KYC Verified
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                            This customer's identity verification has been successfully completed.
                        </p>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Kyc;

