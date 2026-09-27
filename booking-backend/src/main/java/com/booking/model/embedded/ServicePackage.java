package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServicePackage {

    private String id;

    private String name;

    private BigDecimal price;

    private List<String> features = new ArrayList<>();

    private boolean active;

}