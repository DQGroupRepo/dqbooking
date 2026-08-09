package com.booking.service;

public interface AdminServiceModerationService {

    void approveService(String serviceId);

    void rejectService(String serviceId);

    void suspendService(String serviceId);

    void reactivateService(String serviceId);
}