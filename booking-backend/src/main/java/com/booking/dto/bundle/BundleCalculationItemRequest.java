package com.booking.dto.bundle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BundleCalculationItemRequest {

    @NotBlank
    private String serviceId;

    @NotNull
    private LocalDateTime bookingFrom;

    @NotNull
    private LocalDateTime bookingTo;

    private String packageId;

    private Integer guestCount;

    private Integer roomQuantity;

    private java.util.List<String> selectedBeautyServiceIds = new java.util.ArrayList<>();
}
