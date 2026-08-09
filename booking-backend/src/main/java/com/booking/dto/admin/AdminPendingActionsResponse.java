package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPendingActionsResponse {

    private long pendingVendorVerifications;

    private long pendingServiceModerations;

    private long pendingBookings;
}