package com.booking.dto.vendorservice;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingSettingsDto {

    private Integer maxSimultaneousBookings;

    private Boolean bundleOfferEnabled;

}