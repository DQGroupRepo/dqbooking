package com.booking.mapper;

import com.booking.dto.notification.NotificationResponse;
import com.booking.model.Notification;

public interface NotificationMapper {

    NotificationResponse toResponse(
            Notification notification
    );

}