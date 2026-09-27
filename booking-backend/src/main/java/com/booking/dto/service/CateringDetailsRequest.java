package com.booking.dto.service;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringDetailsRequest {

    private boolean vegetarian;

    private boolean nonVegetarian;

    private List<String> cuisines = new ArrayList<>();

    private boolean providesCateringStaff;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal staffCostPerPerson;

    @Min(0)
    private Integer maximumServiceDistanceKm;

}