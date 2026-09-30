package com.bank.service;

import com.bank.dto.*;

import java.util.List;

public interface LoanService {
    LoanResponse apply(LoanApplicationRequest request);
    LoanResponse verifyKyc(Long loanId);
    LoanResponse evaluateCredit(Long loanId);
    LoanResponse approve(Long loanId);
    LoanResponse sanction(Long loanId);
    LoanResponse disburse(Long loanId, DisburseLoanRequest request);
    LoanResponse reject(Long loanId);
    LoanResponse getById(Long loanId);
    List<LoanResponse> getByCustomer(Long customerId);
    List<EmiResponse> getEmis(Long loanId);
    void payEmi(Long emiId, PayEmiRequest request);
}
