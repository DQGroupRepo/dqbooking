package com.booking.service.impl;

import com.booking.dto.settings.VendorSettingsChangeSubmission;
import com.booking.dto.settings.VendorSettingsDecisionRequest;
import com.booking.model.User;
import com.booking.model.VendorSettingsChangeRequest;
import com.booking.model.enums.NotificationType;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorSettingsChangeRequestRepository;
import com.booking.service.NotificationService;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorPermissionService;
import com.booking.model.enums.VendorPage;
import com.booking.service.VendorSettingsApprovalService;
import com.booking.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorSettingsApprovalServiceImpl implements VendorSettingsApprovalService {
    private final VendorSettingsChangeRequestRepository requests;
    private final UserRepository users;
    private final VendorAccessService vendorAccess;
    private final VendorPermissionService vendorPermissionService;
    private final NotificationService notifications;
    private final StorageService storage;

    private static final Map<String, String> LABELS = Map.ofEntries(
            Map.entry("logo", "Business logo"), Map.entry("gstNumber", "GST Number"),
            Map.entry("panNumber", "PAN Number"), Map.entry("businessLicense", "Business License Number"),
            Map.entry("gstCertificateUrl", "GST Certificate"), Map.entry("panCardUrl", "PAN Card"),
            Map.entry("businessLicenseUrl", "Business License Document"),
            Map.entry("accountHolder", "Account Holder"), Map.entry("bankName", "Bank Name"),
            Map.entry("accountNumber", "Account Number"), Map.entry("ifsc", "IFSC Code"),
            Map.entry("upiId", "UPI ID"), Map.entry("payoutMethod", "Primary Payout Method")
    );

    @Override
    public void submit(VendorSettingsChangeSubmission request) {
        vendorPermissionService.checkEdit(VendorPage.PROFILE);
        String vendorId = vendorAccess.getEffectiveVendorId();
        if (request == null || request.getChanges() == null || request.getChanges().isEmpty())
            throw new IllegalArgumentException("No settings changes were submitted.");
        User vendor = users.findById(vendorId).orElseThrow(() -> new IllegalArgumentException("Vendor not found."));
        Set<String> submittedKeys = request.getChanges().entrySet().stream()
                .filter(e -> LABELS.containsKey(e.getKey()) && !Objects.equals(read(vendor, e.getKey()), e.getValue()))
                .map(Map.Entry::getKey).collect(Collectors.toSet());
        boolean overlap = requests.findByVendorIdOrderBySubmittedAtDesc(vendorId).stream()
                .filter(r -> r.getItems() != null)
                .flatMap(r -> r.getItems().stream())
                .anyMatch(i -> "PENDING".equals(i.getStatus()) && submittedKeys.contains(i.getKey()));
        if (overlap) throw new IllegalArgumentException("One or more changed settings already have a pending Admin review. Wait for that review before submitting another change to those fields.");
        VendorSettingsChangeRequest record = new VendorSettingsChangeRequest();
        record.setVendorId(vendorId);
        List<VendorSettingsChangeRequest.Item> items = new ArrayList<>();
        Set<String> bankKeys = Set.of("accountHolder", "bankName", "accountNumber", "ifsc", "upiId", "payoutMethod");
        boolean bankGroupChanged = request.getChanges().entrySet().stream()
                .anyMatch(e -> bankKeys.contains(e.getKey()) && !Objects.equals(read(vendor, e.getKey()), e.getValue()));
        for (Map.Entry<String, String> entry : request.getChanges().entrySet()) {
            String key = entry.getKey();
            if (!LABELS.containsKey(key)) throw new IllegalArgumentException("Unsupported approval-controlled setting: " + key);
            VendorSettingsChangeRequest.Item item = new VendorSettingsChangeRequest.Item();
            item.setKey(key); item.setLabel(LABELS.get(key)); item.setGroup(key.equals("logo") ? "LOGO" :
                    (Set.of("accountHolder", "bankName", "accountNumber", "ifsc", "upiId", "payoutMethod").contains(key) ? "BANK_DETAILS" : key));
            item.setOldValue(read(vendor, key)); item.setProposedValue(entry.getValue());
            if (Objects.equals(item.getOldValue(), item.getProposedValue()) && !(bankGroupChanged && bankKeys.contains(key))) continue;
            items.add(item);
        }
        if (items.isEmpty()) throw new IllegalArgumentException("There are no changes to submit for approval.");
        record.setItems(items);
        requests.save(record);
    }

    @Override public List<VendorSettingsChangeRequest> getOwnRequests() {
        return requests.findByVendorIdOrderBySubmittedAtDesc(vendorAccess.getEffectiveVendorId());
    }

    @Override public List<VendorSettingsChangeRequest> getPending(String vendorId) {
        return requests.findByVendorIdOrderBySubmittedAtDesc(vendorId).stream()
                .filter(r -> r.getItems() != null && r.getItems().stream().anyMatch(i -> "PENDING".equals(i.getStatus())))
                .toList();
    }

    @Override
    public void decide(String vendorId, VendorSettingsDecisionRequest decision) {
        if (decision == null || decision.getItemKeys() == null || decision.getItemKeys().isEmpty())
            throw new IllegalArgumentException("Select at least one settings item.");
        String action = decision.getAction() == null ? "" : decision.getAction().toUpperCase(Locale.ROOT);
        if (!Set.of("APPROVE", "REJECT").contains(action)) throw new IllegalArgumentException("Action must be APPROVE or REJECT.");
        if ("REJECT".equals(action) && (decision.getReason() == null || decision.getReason().isBlank()))
            throw new IllegalArgumentException("A rejection reason is required.");

        User vendor = users.findById(vendorId).orElseThrow(() -> new IllegalArgumentException("Vendor not found."));
        Set<String> selected = new HashSet<>(decision.getItemKeys());
        List<VendorSettingsChangeRequest> records = requests.findByVendorIdOrderBySubmittedAtDesc(vendorId);
        // Validate atomic bank-group selections before changing any request or live profile data.
        for (VendorSettingsChangeRequest record : records) {
            for (VendorSettingsChangeRequest.Item item : record.getItems()) {
                if (selected.contains(record.getId() + ":" + item.getKey()) && "PENDING".equals(item.getStatus()) && "BANK_DETAILS".equals(item.getGroup())) {
                    List<VendorSettingsChangeRequest.Item> bankItems = record.getItems().stream()
                            .filter(i -> "BANK_DETAILS".equals(i.getGroup()) && "PENDING".equals(i.getStatus())).toList();
                    if (bankItems.stream().anyMatch(i -> !selected.contains(record.getId() + ":" + i.getKey())))
                        throw new IllegalArgumentException("Select all pending bank and payout fields together.");
                }
            }
        }
        List<String> deleteAfterSave = new ArrayList<>();
        int decided = 0;
        for (VendorSettingsChangeRequest record : records) {
            for (VendorSettingsChangeRequest.Item item : record.getItems()) {
                if (!selected.contains(record.getId() + ":" + item.getKey()) || !"PENDING".equals(item.getStatus())) continue;
                if ("APPROVE".equals(action)) {
                    write(vendor, item.getKey(), item.getProposedValue());
                    if (item.getOldValue() != null && !item.getOldValue().isBlank() && isFile(item.getKey())) deleteAfterSave.add(item.getOldValue());
                    item.setStatus("APPROVED");
                } else {
                    if (item.getProposedValue() != null && !item.getProposedValue().isBlank() && isFile(item.getKey())) deleteAfterSave.add(item.getProposedValue());
                    item.setStatus("REJECTED"); item.setRejectionReason(decision.getReason().trim());
                }
                item.setDecidedAt(LocalDateTime.now()); decided++;
            }
        }
        if (decided == 0) throw new IllegalArgumentException("No selected pending settings were found.");
        // Persist the canonical live profile before marking approval records complete.
        // If this save fails, the request items remain pending and can be retried safely.
        if ("APPROVE".equals(action)) users.save(vendor);
        for (VendorSettingsChangeRequest record : records) {
            if (record.getItems().stream().anyMatch(i -> selected.contains(record.getId() + ":" + i.getKey()) && !"PENDING".equals(i.getStatus()))) {
                requests.save(record);
            }
        }
        for (String url : deleteAfterSave) {
            try { storage.delete(url); } catch (Exception ignored) { /* Keep approval result; cleanup can be retried operationally. */ }
        }
        if ("REJECT".equals(action)) notifications.createNotification(vendorId, NotificationType.SYSTEM,
                "Settings changes rejected", "Your submitted settings changes were rejected. Reason: " + decision.getReason().trim(), null);
        else notifications.createNotification(vendorId, NotificationType.SYSTEM,
                "Settings changes approved", "Your selected settings changes have been approved and are now active.", null);
    }

    @Override public Map<String, Long> pendingCounts(List<String> vendorIds) {
        Map<String, Long> result = new HashMap<>();
        for (String id : vendorIds) result.put(id, getPending(id).stream().mapToLong(r -> r.getItems().stream().filter(i -> "PENDING".equals(i.getStatus())).count()).sum());
        return result;
    }

    private String read(User u, String k) { return switch (k) {
        case "logo" -> u.getLogo(); case "gstNumber" -> u.getGstNumber(); case "panNumber" -> u.getPanNumber();
        case "businessLicense" -> u.getBusinessLicense(); case "gstCertificateUrl" -> u.getGstCertificateUrl();
        case "panCardUrl" -> u.getPanCardUrl(); case "businessLicenseUrl" -> u.getBusinessLicenseUrl();
        case "accountHolder" -> u.getAccountHolder(); case "bankName" -> u.getBankName(); case "accountNumber" -> u.getAccountNumber();
        case "ifsc" -> u.getIfsc(); case "upiId" -> u.getUpiId(); case "payoutMethod" -> u.getPayoutMethod(); default -> null; }; }
    private void write(User u, String k, String v) { switch (k) {
        case "logo" -> u.setLogo(v); case "gstNumber" -> u.setGstNumber(v); case "panNumber" -> u.setPanNumber(v);
        case "businessLicense" -> u.setBusinessLicense(v); case "gstCertificateUrl" -> u.setGstCertificateUrl(v);
        case "panCardUrl" -> u.setPanCardUrl(v); case "businessLicenseUrl" -> u.setBusinessLicenseUrl(v);
        case "accountHolder" -> u.setAccountHolder(v); case "bankName" -> u.setBankName(v); case "accountNumber" -> u.setAccountNumber(v);
        case "ifsc" -> u.setIfsc(v); case "upiId" -> u.setUpiId(v); case "payoutMethod" -> u.setPayoutMethod(v);
        default -> throw new IllegalArgumentException("Unsupported setting."); } }
    private boolean isFile(String key) { return Set.of("logo", "gstCertificateUrl", "panCardUrl", "businessLicenseUrl").contains(key); }
}
