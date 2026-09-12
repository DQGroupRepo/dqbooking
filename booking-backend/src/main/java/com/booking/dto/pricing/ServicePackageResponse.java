package com.booking.dto.pricing;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ServicePackageResponse {

    private String id;

    private String type;

    private BigDecimal price;

    private List<String> features;

    private boolean active;

}