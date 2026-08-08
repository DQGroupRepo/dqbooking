package com.booking.mapper;

import com.booking.dto.pricing.CancellationPolicyRequest;
import com.booking.dto.pricing.CancellationPolicyResponse;
import com.booking.model.embedded.CancellationPolicy;

public interface CancellationPolicyMapper {

    CancellationPolicy toEntity(
            CancellationPolicyRequest request
    );

    CancellationPolicyResponse toResponse(
            CancellationPolicy policy
    );

    CancellationPolicy defaultPolicy();

}