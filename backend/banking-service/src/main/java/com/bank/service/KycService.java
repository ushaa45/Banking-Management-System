package com.bank.service;

import com.bank.dto.KycRequest;
import com.bank.dto.KycResponse;
import com.bank.entity.Kyc;

public interface KycService {

    KycResponse submit(Long customerId, KycRequest request);

    KycResponse verify(Long customerId);

    KycResponse reject(Long customerId, String reason);

    KycResponse getByCustomer(Long customerId);
}