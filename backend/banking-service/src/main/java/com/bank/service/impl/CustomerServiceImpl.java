package com.bank.service.impl;

import com.bank.dto.CustomerRequest;
import com.bank.dto.CustomerResponse;
import com.bank.entity.Customer;
import com.bank.entity.Kyc;
import com.bank.entity.KycStatus;
import com.bank.exception.CustomerNotFoundException;
import com.bank.exception.DuplicateResourceException;
import com.bank.repository.CustomerRepository;
import com.bank.repository.KycRepository;
import com.bank.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final KycRepository kycRepository;

    @Override
    @Transactional
    public CustomerResponse register(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A customer with this email already exists");
        }

        Customer customer = Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .kycStatus(KycStatus.PENDING)
                .status("ACTIVE")
                .build();

        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    @Override
    public CustomerResponse getById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + customerId));
        return toResponse(customer);
    }

    @Override
    public List<CustomerResponse> getAll() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CustomerResponse update(Long customerId, CustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + customerId));

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        customer.setDateOfBirth(request.getDateOfBirth());
        // Email intentionally not editable here to keep it as a stable identifier;
        // add a dedicated verified-email-change flow if you need this later.

        return toResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse submitKyc(Long customerId) {
        Customer customer = findCustomer(customerId);
        if(customer.getKycStatus() == KycStatus.VERIFIED) {
            throw new IllegalStateException("Kyc already verified");
        }
        if(customer.getKycStatus() == KycStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Kyc already under review");
        }
        customer.setKycStatus(KycStatus.PENDING);

        return toResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse verifyKyc(Long customerId) {
        Customer customer = findCustomer(customerId);
        if (customer.getKycStatus() != KycStatus.UNDER_REVIEW) {
            throw new IllegalStateException(
                    "KYC must be UNDER_REVIEW before verification. " +
                            "Current status: " + customer.getKycStatus()
            );
        }
        customer.setKycStatus(KycStatus.VERIFIED);
        return toResponse(customerRepository.save(customer));
    }

    /*
    * Bank employee/admin rejects KYC.
    * UNDER_REVIEW -> REJECTED
    */

    @Override
    @Transactional
    public CustomerResponse rejectKyc(Long customerId) {
        Customer customer = findCustomer(customerId);
        if (customer.getKycStatus() != KycStatus.UNDER_REVIEW)
        {
            throw new IllegalStateException( "KYC must be UNDER_REVIEW before rejection. " +
                    "Current status: " + customer.getKycStatus() );
        }
        customer.setKycStatus(KycStatus.REJECTED);
        return toResponse(customerRepository.save(customer));
    }

    private Customer findCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new CustomerNotFoundException( "Customer not found: " + customerId
                        )
                );
    }

    private CustomerResponse toResponse(Customer c) {

        KycStatus kycStatus = kycRepository
                .findByCustomerCustomerId(c.getCustomerId())
                .map(Kyc::getStatus)
                .orElse(KycStatus.PENDING);

        return CustomerResponse.builder()
                .customerId(c.getCustomerId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .dateOfBirth(c.getDateOfBirth())
                .kycStatus(kycStatus)
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
