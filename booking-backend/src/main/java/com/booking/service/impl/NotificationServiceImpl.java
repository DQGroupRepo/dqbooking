package com.booking.service.impl;

import com.booking.dto.notification.NotificationResponse;
import com.booking.mapper.NotificationMapper;
import com.booking.model.Notification;
import com.booking.model.User;
import com.booking.model.enums.NotificationType;
import com.booking.repository.NotificationRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final NotificationMapper notificationMapper;

    private final AuthenticatedUserService authenticatedUserService;

    @Override
    public List<NotificationResponse> getNotifications() {

        User user =
                authenticatedUserService.getCurrentUser();

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(notificationMapper::toResponse)
                .toList();

    }

    @Override
    public long getUnreadCount() {

        User user =
                authenticatedUserService
                        .getCurrentUser();

        return notificationRepository
                .countByUserIdAndReadFalse(
                        user.getId()
                );

    }

    @Override
    public void markAsRead(
            String notificationId
    ) {

        User user =
                authenticatedUserService
                        .getCurrentUser();


        Notification notification =
                notificationRepository
                        .findById(
                                notificationId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found."
                                )
                        );


        /*
         * Important:
         * A user must only be able to mark
         * their own notification as read.
         */

        if (
                !notification
                        .getUserId()
                        .equals(
                                user.getId()
                        )
        ) {

            throw new IllegalArgumentException(
                    "You cannot update this notification."
            );

        }


        notification.setRead(
                true
        );


        notificationRepository.save(
                notification
        );

    }

    @Override
    public void markAllAsRead() {

        User user =
                authenticatedUserService
                        .getCurrentUser();


        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalse(
                                user.getId()
                        );


        notifications.forEach(
                notification ->
                        notification.setRead(true)
        );


        notificationRepository.saveAll(
                notifications
        );

    }

    @Override
    public void createNotification(
            String userId,
            NotificationType type,
            String title,
            String message,
            String referenceId) {

        Notification notification = new Notification();

        notification.setUserId(userId);

        notification.setType(type);

        notification.setTitle(title);

        notification.setMessage(message);

        notification.setReferenceId(referenceId);

        notificationRepository.save(notification);

    }

}