package com.booking.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID = "correlationId";
    public static final String CORRELATION_HEADER = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String correlationId = getOrCreateCorrelationId(request);

        MDC.put(CORRELATION_ID, correlationId);

        // Return the same ID to the client.
        response.setHeader(CORRELATION_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            clearMdc();
        }
    }

    private String getOrCreateCorrelationId(HttpServletRequest request) {

        String incomingId = request.getHeader(CORRELATION_HEADER);

        if (isValidCorrelationId(incomingId)) {
            return incomingId;
        }

        return UUID.randomUUID().toString();
    }

    private boolean isValidCorrelationId(String value) {

        if (value == null || value.isBlank()) {
            return false;
        }

        if (value.length() > 100) {
            return false;
        }

        /*
         * Allow only characters that are safe to place
         * into logs and HTTP headers.
         */
        return value.matches("[a-zA-Z0-9._:-]+");
    }

    private void clearMdc() {

        MDC.remove(CORRELATION_ID);
        MDC.remove("userId");
        MDC.remove("role");
        MDC.remove("vendorId");
    }
}