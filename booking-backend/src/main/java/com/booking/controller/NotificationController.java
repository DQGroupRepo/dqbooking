package com.booking.controller;

import com.booking.dto.notification.NotificationResponse;
import com.booking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


    @GetMapping
    public List<NotificationResponse> getNotifications() {

        return notificationService.getNotifications();

    }


    @GetMapping("/unread-count")
    public long getUnreadCount() {

        return notificationService
                .getUnreadCount();

    }


    @PatchMapping("/{notificationId}/read")
    public void markAsRead(
            @PathVariable String notificationId
    ) {

        notificationService.markAsRead(
                notificationId
        );

    }


    @PatchMapping("/read-all")
    public void markAllAsRead() {

        notificationService
                .markAllAsRead();

    }

}