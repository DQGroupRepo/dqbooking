package com.booking.dto.pricing;

import com.booking.model.enums.RefundOnType;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CancellationPolicyResponse {

    private Boolean allowCancellation;

    private RefundOnType refundOn;

    private Integer processingDays;

    private List<RefundRuleResponse> refundRules =
            new ArrayList<>();

}