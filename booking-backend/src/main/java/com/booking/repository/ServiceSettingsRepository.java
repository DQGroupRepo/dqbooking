package com.booking.repository;

import com.booking.model.ServiceSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ServiceSettingsRepository
        extends MongoRepository<ServiceSettings, String> {

    Optional<ServiceSettings> findByServiceId(String serviceId);

}