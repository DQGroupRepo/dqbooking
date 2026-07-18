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