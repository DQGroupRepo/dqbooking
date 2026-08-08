package com.booking.mapper.impl;

import com.booking.dto.pricing.CancellationPolicyRequest;
import com.booking.dto.pricing.CancellationPolicyResponse;
import com.booking.dto.pricing.RefundRuleRequest;
import com.booking.dto.pricing.RefundRuleResponse;
import com.booking.model.embedded.CancellationPolicy;
import com.booking.model.embedded.RefundRule;
import com.booking.model.enums.RefundOnType;
import org.springframework.stereotype.Component;
import  com.booking.mapper.CancellationPolicyMapper;

import java.util.ArrayList;
import java.util.List;

@Component
public class CancellationPolicyMapperImpl
        implements CancellationPolicyMapper {

    @Override
    public CancellationPolicy toEntity(
            CancellationPolicyRequest request
    ) {

        if (request == null) {
            return null;
        }

        CancellationPolicy policy =
                new CancellationPolicy();

        policy.setAllowCancellation(
                request.getAllowCancellation()
        );

        policy.setRefundOn(
                request.getRefundOn()
        );

        policy.setProcessingDays(
                request.getProcessingDays()
        );

        policy.setRefundRules(
                toEntityList(
                        request.getRefundRules()
                )
        );

        return policy;
    }

    @Override
    public CancellationPolicyResponse toResponse(
            CancellationPolicy policy
    ) {

        if (policy == null) {
            return null;
        }

        CancellationPolicyResponse response =
                new CancellationPolicyResponse();

        response.setAllowCancellation(
                policy.getAllowCancellation()
        );

        response.setRefundOn(
                policy.getRefundOn()
        );

        response.setProcessingDays(
                policy.getProcessingDays()
        );

        response.setRefundRules(
                toResponseList(
                        policy.getRefundRules()
                )
        );

        return response;
    }

    /*
     * ==========================================
     * Refund Rule Mapping
     * ==========================================
     */

    private RefundRule toEntity(
            RefundRuleRequest request
    ) {

        if (request == null) {
            return null;
        }

        RefundRule rule =
                new RefundRule();

        rule.setMinDaysBeforeEvent(
                request.getMinDaysBeforeEvent()
        );

        rule.setMaxDaysBeforeEvent(
                request.getMaxDaysBeforeEvent()
        );

        rule.setRefundPercentage(
                request.getRefundPercentage()
        );

        return rule;
    }

    private RefundRuleResponse toResponse(
            RefundRule rule
    ) {

        if (rule == null) {
            return null;
        }

        RefundRuleResponse response =
                new RefundRuleResponse();

        response.setMinDaysBeforeEvent(
                rule.getMinDaysBeforeEvent()
        );

        response.setMaxDaysBeforeEvent(
                rule.getMaxDaysBeforeEvent()
        );

        response.setRefundPercentage(
                rule.getRefundPercentage()
        );

        return response;
    }

    private List<RefundRule> toEntityList(
            List<RefundRuleRequest> requests
    ) {

        List<RefundRule> rules =
                new ArrayList<>();

        if (requests == null) {
            return rules;
        }

        requests.forEach(request ->
                rules.add(
                        toEntity(request)
                )
        );

        return rules;
    }

    private List<RefundRuleResponse> toResponseList(
            List<RefundRule> rules
    ) {

        List<RefundRuleResponse> responses =
                new ArrayList<>();

        if (rules == null) {
            return responses;
        }

        rules.forEach(rule ->
                responses.add(
                        toResponse(rule)
                )
        );

        return responses;
    }

    @Override
    public CancellationPolicy defaultPolicy() {

        CancellationPolicy policy =
                new CancellationPolicy();

        policy.setAllowCancellation(true);

        policy.setRefundOn(
                RefundOnType.PAID_AMOUNT
        );

        policy.setProcessingDays(7);

        policy.setRefundRules(new ArrayList<>());

        return policy;

    }

}