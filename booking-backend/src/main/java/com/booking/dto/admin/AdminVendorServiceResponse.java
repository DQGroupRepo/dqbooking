package com.booking.dto.admin;

import com.booking.model.enums.ServiceModerationStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminVendorServiceResponse {

    private String serviceId;

    private String serviceName;

    private String category;

    private ServiceModerationStatus moderationStatus;

    private Boolean active;

    private Boolean deleted;

    private BigDecimal price;
}