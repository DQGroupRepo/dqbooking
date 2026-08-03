package com.booking.dto.pricing;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CancellationPolicyResponse {

    private Boolean cancellationAllowed;

    private List<CancellationRuleResponse> rules;

    private Boolean active;
}