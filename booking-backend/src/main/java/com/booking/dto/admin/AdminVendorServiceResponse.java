package com.booking.dto.admin;

import com.booking.model.enums.ServiceDiscoveryTag;
import com.booking.model.enums.ServiceModerationStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Set;

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

    private Set<ServiceDiscoveryTag> discoveryTags;
}