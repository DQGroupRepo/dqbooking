package com.booking.mapper.impl;

import com.booking.dto.notification.NotificationResponse;
import com.booking.mapper.NotificationMapper;
import com.booking.model.Notification;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class NotificationMapperImpl
        implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(
            Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType()
                        .name()
                        .toLowerCase())
                .time(formatTime(notification.getCreatedAt()))
                .build();

    }

    private String formatTime(LocalDateTime createdAt) {

        Duration duration =
                Duration.between(createdAt, LocalDateTime.now());

        long minutes = duration.toMinutes();

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return minutes + " min ago";
        }

        long hours = duration.toHours();

        if (hours < 24) {
            return hours + " hr ago";
        }

        long days = duration.toDays();

        if (days == 1) {
            return "Yesterday";
        }

        return days + " days ago";

    }

}