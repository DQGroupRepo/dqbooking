package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringDetails {

    private boolean vegetarian;

    private boolean nonVegetarian;

    private List<String> cuisines = new ArrayList<>();

    private boolean providesCateringStaff;

    private BigDecimal staffCostPerPerson;

    private Integer maximumServiceDistanceKm;

}