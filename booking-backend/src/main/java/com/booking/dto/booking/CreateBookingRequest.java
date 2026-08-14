package com.booking.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateBookingRequest {

    private List<BookingBundleItemRequest> bundles;

    private List<BookingServiceItemRequest> services;

    private String specialRequest;

    @NotBlank
    private String eventType;
}