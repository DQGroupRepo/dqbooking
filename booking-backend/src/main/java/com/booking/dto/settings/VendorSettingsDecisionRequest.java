package com.booking.dto.settings;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class VendorSettingsDecisionRequest {
    private List<String> itemKeys;
    private String action;
    private String reason;
}
