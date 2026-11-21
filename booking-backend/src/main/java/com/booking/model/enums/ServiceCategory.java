package com.booking.model.enums;

public enum ServiceCategory {

    HALL,
    CATERING,
    PHOTOGRAPHY,
    DECORATION,
    MAKEUP,
    STAY;

    /** Categories whose inventory is managed as separately reservable physical resources. */
    public boolean supportsResourceTypes() {
        return this == STAY || this == HALL;
    }

}