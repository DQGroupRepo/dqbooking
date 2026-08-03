package com.booking.dto.pricing;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CancellationPolicyRequest {

    private Boolean cancellationAllowed = true;

    @Valid
    private List<CancellationRuleRequest> rules;

    private Boolean active = true;
}