package com.booking.dto.settings;

import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@Getter @Setter
public class VendorSettingsChangeSubmission {
    private Map<String, String> changes;
}
