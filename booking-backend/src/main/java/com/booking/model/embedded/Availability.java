package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class Availability {

    private LocalDate availableFrom;

    private LocalDate availableTo;

}