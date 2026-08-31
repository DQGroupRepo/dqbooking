package com.booking.dto.notification;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {

    private String id;

    private String userId;

    private String title;

    private String message;

    private String type;

    private String referenceId;

    private Boolean read;

    private LocalDateTime createdAt;

}