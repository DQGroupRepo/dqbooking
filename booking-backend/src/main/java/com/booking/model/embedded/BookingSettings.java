package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingSettings {

    private Integer maxSimultaneousBookings;

    private Boolean bundleOfferEnabled;

}