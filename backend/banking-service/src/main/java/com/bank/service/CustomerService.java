package com.bank.service;

import com.bank.dto.CustomerRequest;
import com.bank.dto.CustomerResponse;

import java.util.List;

public interface CustomerService {
    CustomerResponse register(CustomerRequest request);
    CustomerResponse getById(Long customerId);
    List<CustomerResponse> getAll();
    CustomerResponse update(Long customerId, CustomerRequest request);
    CustomerResponse submitKyc(Long customerId);
    CustomerResponse verifyKyc(Long customerId);
    CustomerResponse rejectKyc(Long customerId);
}
