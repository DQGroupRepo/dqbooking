package com.booking.dto.pricing;

import com.booking.model.enums.RefundOnType;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CancellationPolicyRequest {

    private Boolean allowCancellation;

    private RefundOnType refundOn;

    private Integer processingDays;

    @Valid
    private List<RefundRuleRequest> refundRules =
            new ArrayList<>();

}