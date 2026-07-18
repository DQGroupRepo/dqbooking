package com.booking.dto.notification;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {

    private String id;

    private String message;

    /*
     * booking
     * payment
     * review
     * cancelled
     * system
     */
    private String type;

    private String time;

}