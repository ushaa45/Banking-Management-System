package com.bank.service.impl;

import com.bank.dto.KycRequest;
import com.bank.dto.KycResponse;
import com.bank.entity.Customer;
import com.bank.entity.Kyc;
import com.bank.entity.KycStatus;
import com.bank.repository.CustomerRepository;
import com.bank.repository.KycRepository;
import com.bank.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class KycServiceImpl implements KycService {

    private final KycRepository kycRepository;
    private final CustomerRepository customerRepository;

    @Override
    public KycResponse submit(Long customerId, KycRequest request){
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not Found : " + customerId));

        Kyc kyc = kycRepository
                .findByCustomerCustomerId(customerId)
                .orElseGet(()->
                        Kyc.builder()
                                .customer(customer)
                                .build());

        if (kyc.getStatus() == KycStatus.UNDER_REVIEW) {
            throw new IllegalStateException(
                    "KYC is already under review"
            );
        }

        if (kyc.getStatus() == KycStatus.VERIFIED) {
            throw new IllegalStateException(
                    "KYC is already verified"
            );
        }

        kyc.setDocumentType(request.getDocumentType());
        kyc.setDocumentNumber(request.getDocumentNumber());
        kyc.setStatus(KycStatus.UNDER_REVIEW);
        kyc.setSubmittedAt(LocalDateTime.now());
        kyc.setRejectionReason(null);

        Kyc savedKyc = kycRepository.save(kyc);

        return toResponse(savedKyc);

    }

    @Override
    public KycResponse verify(Long customerId){

        Kyc kyc = getKyc(customerId);

        if(kyc.getStatus() != KycStatus.UNDER_REVIEW){
            throw new IllegalStateException("Only KYC under review can be verified");
        }

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        kyc.setStatus(KycStatus.VERIFIED);
        kyc.setVerifiedAt(LocalDateTime.now());
        kyc.setVerifiedBy(username);
        kyc.setRejectionReason(null);

        Kyc savedKyc = kycRepository.save(kyc);
        return toResponse(savedKyc);
    }

    @Override
    public KycResponse reject(Long customerId, String reason) {

        Kyc kyc = getKyc(customerId);

        if (kyc.getStatus() != KycStatus.UNDER_REVIEW) {
            throw new IllegalStateException(
                    "Only KYC under review can be rejected"
            );
        }

        kyc.setStatus(KycStatus.REJECTED);
        kyc.setRejectionReason(reason);
        kyc.setVerifiedAt(null);
        kyc.setVerifiedBy(null);

        Kyc savedKyc = kycRepository.save(kyc);

        return toResponse(savedKyc);
    }

    @Override
    @Transactional(readOnly = true)
    public KycResponse getByCustomer(Long customerId) {
        return kycRepository
                .findByCustomerCustomerId(customerId)
                .map(this::toResponse)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "KYC not found for customer: " + customerId
                        ));
    }

    private Kyc getKyc(Long customerId) {

        return kycRepository
                .findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException(
                        "KYC not found for customer: "+ customerId
                ));
    }

    private KycResponse toResponse(Kyc kyc) {

        return KycResponse.builder()
                .kycId(kyc.getKycId())
                .customerId(kyc.getCustomer().getCustomerId())
                .documentType(kyc.getDocumentType())
                .documentNumber(kyc.getDocumentNumber())
                .status(kyc.getStatus())
                .rejectionReason(kyc.getRejectionReason())
                .submittedAt(kyc.getSubmittedAt())
                .verifiedAt(kyc.getVerifiedAt())
                .verifiedBy(kyc.getVerifiedBy())
                .createdAt(kyc.getCreatedAt())
                .updatedAt(kyc.getUpdatedAt())
                .build();
    }

}
