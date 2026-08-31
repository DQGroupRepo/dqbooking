package com.booking.service;

import com.booking.dto.notification.NotificationResponse;
import com.booking.model.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications();

    long getUnreadCount();

    void markAsRead(
            String notificationId
    );

    void markAllAsRead();

    void createNotification(
            String userId,
            NotificationType type,
            String title,
            String message,
            String referenceId
    );

}