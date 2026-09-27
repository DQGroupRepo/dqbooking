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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final NotificationMapper notificationMapper;

    private final AuthenticatedUserService authenticatedUserService;

    @Override
    public List<NotificationResponse> getNotifications() {

        User user =
                authenticatedUserService.getCurrentUser();

        List<NotificationResponse> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedTsDesc(user.getId())
                        .stream()
                        .map(notificationMapper::toResponse)
                        .toList();

        log.info("Retrieved notifications userId={} notificationCount={}",
                user.getId(), notifications.size());

        return notifications;
    }

    @Override
    public long getUnreadCount() {

        User user =
                authenticatedUserService
                        .getCurrentUser();

        long unreadCount =
                notificationRepository
                        .countByUserIdAndReadFalse(
                                user.getId()
                        );

        log.debug("Retrieved unread notification count userId={} unreadCount={}",
                user.getId(), unreadCount);

        return unreadCount;
    }

    @Override
    public void markAsRead(
            String notificationId
    ) {

        User user =
                authenticatedUserService
                        .getCurrentUser();

        log.info("Marking notification as read userId={} notificationId={}",
                user.getId(), notificationId);

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

        if (
                !notification
                        .getUserId()
                        .equals(
                                user.getId()
                        )
        ) {

            log.warn("Notification update denied userId={} notificationId={}",
                    user.getId(), notificationId);

            throw new IllegalArgumentException(
                    "You cannot update this notification."
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);

        log.info("Notification marked as read userId={} notificationId={}",
                user.getId(), notificationId);
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

        log.info("Marked all notifications as read userId={} updatedCount={}",
                user.getId(), notifications.size());
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

        log.info("Notification created userId={} type={} referenceId={}",
                userId, type, referenceId);
    }

}
