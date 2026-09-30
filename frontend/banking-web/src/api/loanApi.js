import API from "./api"

const loanApi = {
    // =========================
    // LOAN APPLICATION
    // =========================

    apply: async (data) => {
        const response = await API.post("/loans/apply", data);
        return response.data;
    },

    // =========================
    // LOAN DETAILS
    // =========================

    getById: async (loanId) => {
        const response = await API.get(`/loans/${loanId} `);
        return response.data;
    },

    getByCustomer: async (customerId) => {
        const response = await API.get(`/loans/customer/${customerId} `);
        return response.data;
    },

    // =========================
    // WORKFLOW ACTIONS
    // =========================

    verifyKyc: async (loanId) => {
        const response = await API.post(`/loans/${loanId}/kyc-verify`);
        return response.data;
    },

    evaluateCredit: async (loanId) => {
        const response = await API.post(`/loans/${loanId}/credit-evaluate`);
        return response.data;
    },

    approve: async (loanId) => {
        const response = await API.post(`/loans/${loanId}/approve`);
        return response.data;
    },

    sanction: async (loanId) => {
        const response = await API.post(`/loans/${loanId}/sanction`);
        return response.data;
    },

    disburse: async (loanId, data) => {
        const response = await API.post(`/loans/${loanId}/disburse`, data);
        return response.data;
    },

    reject: async (loanId) => {
        const response = await API.post(`/loans/${loanId}/reject`);
        return response.data;
    },

    // =========================
    // EMI
    // =========================

    getEmis: async (loanId) => {
        const response = await API.get(`/loans/${loanId}/emis`);
        return response.data;
    },

    payEmi: async (emiId, data) => {
        const response = await API.post(`/loans/emis/${emiId}/pay`, data);
        return response.data;
    },
};

export default loanApi;