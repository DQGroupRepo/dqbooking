package com.booking.dto.customer;

import com.booking.model.embedded.ServicePackage;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class EventPricingResponse {

    private String serviceId;

    private LocalDate eventDate;

    private Integer version;

    private BigDecimal baseAmount;

    private List<ServicePackage> packages;
}