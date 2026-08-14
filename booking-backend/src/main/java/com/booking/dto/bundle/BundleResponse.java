package com.booking.dto.bundle;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class BundleResponse {

    private String id;

    private String vendorId;

    private String name;

    private String description;

    private List<String> serviceIds;

    private String discountType;

    private BigDecimal discountValue;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}