package com.booking.exception;

import lombok.Getter;

@Getter
public class ExpiredBookingHoldException extends RuntimeException {

    private final String serviceId;
    private final String slotId;
    private final String eventDate;
    private final String holdId;

    public ExpiredBookingHoldException(String serviceId, String slotId, String eventDate) {
        this(serviceId, slotId, eventDate, null);
    }

    public ExpiredBookingHoldException(
            String serviceId, String slotId, String eventDate, String holdId
    ) {
        super("Your hold for the selected time slot has expired or is no longer valid. " +
                "Please select the slot again.");
        this.serviceId = serviceId;
        this.slotId = slotId;
        this.eventDate = eventDate;
        this.holdId = holdId;
    }
}