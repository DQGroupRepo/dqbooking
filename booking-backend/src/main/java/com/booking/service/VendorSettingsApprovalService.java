package com.booking.service;

import com.booking.dto.settings.VendorSettingsChangeSubmission;
import com.booking.dto.settings.VendorSettingsDecisionRequest;
import com.booking.model.VendorSettingsChangeRequest;
import java.util.List;
import java.util.Map;

public interface VendorSettingsApprovalService {
    void submit(VendorSettingsChangeSubmission request);
    List<VendorSettingsChangeRequest> getOwnRequests();
    List<VendorSettingsChangeRequest> getPending(String vendorId);
    void decide(String vendorId, VendorSettingsDecisionRequest request);
    Map<String, Long> pendingCounts(List<String> vendorIds);
}
