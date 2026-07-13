package com.booking.dto.vendorservice;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AvailabilityDto {

    private LocalDate availableFrom;

    private LocalDate availableTo;

}