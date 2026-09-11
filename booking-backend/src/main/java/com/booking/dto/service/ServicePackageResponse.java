package com.booking.dto.service;

import com.booking.model.enums.ServicePackageType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ServicePackageResponse {

    private String id;

    private ServicePackageType type;

    private BigDecimal price;

    private List<String> features;

    private boolean active;

}