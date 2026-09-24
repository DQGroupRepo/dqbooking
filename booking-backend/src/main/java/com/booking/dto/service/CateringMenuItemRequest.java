package com.booking.dto.service;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CateringMenuItemRequest {

    private String id;

    private String dishId;

    private String customName;

    private String cuisine;

    private String category;

    private String foodType;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal pricePerPerson;

    private boolean active = true;

}