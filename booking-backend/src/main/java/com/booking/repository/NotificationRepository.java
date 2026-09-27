package com.booking.repository;

import com.booking.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedTsDesc(
            String userId
    );

    long countByUserIdAndReadFalse(
            String userId
    );

    List<Notification> findByUserIdAndReadFalse(
            String userId
    );

}