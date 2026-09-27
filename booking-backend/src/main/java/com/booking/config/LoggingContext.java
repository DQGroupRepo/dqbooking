package com.booking.config;

import org.slf4j.MDC;

public final class LoggingContext {

    private LoggingContext() {
    }

    public static void setUser(String userId, String role) {

        if (userId != null && !userId.isBlank()) {
            MDC.put("userId", userId);
        }

        if (role != null && !role.isBlank()) {
            MDC.put("role", role);
        }
    }

    public static void setVendorId(String vendorId) {

        if (vendorId != null && !vendorId.isBlank()) {
            MDC.put("vendorId", vendorId);
        }
    }

    public static void clearVendorId() {
        MDC.remove("vendorId");
    }
}