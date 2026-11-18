package com.booking.controller;

import com.booking.model.enums.Role;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
public class MonitoringController {

    private final UserRepository userRepository;

    /**
     * Supplied through the MONITORING_SECRET environment variable.
     * Keep this value out of source control.
     */
    @Value("${monitoring.secret:}")
    private String monitoringSecret;

    @GetMapping("/vendor-count")
    public ResponseEntity<Map<String, Object>> getVendorCount(
            @RequestHeader(value = "X-Monitor-Token", required = false)
            String providedToken
    ) {
        if (monitoringSecret == null || monitoringSecret.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("status", "NOT_CONFIGURED"));
        }

        if (providedToken == null || !MessageDigest.isEqual(
                monitoringSecret.getBytes(StandardCharsets.UTF_8),
                providedToken.getBytes(StandardCharsets.UTF_8)
        )) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "UNAUTHORIZED"));
        }

        // VENDOR_ADMIN is the canonical vendor account in DQBooking.
        // VENDOR_USER records are team members and are not counted as vendors.
        long vendorCount = userRepository.countByRoleAndDeletedFalse(
                Role.VENDOR_ADMIN
        );

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "vendorCount", vendorCount,
                "checkedAt", Instant.now().toString()
        ));
    }
}
