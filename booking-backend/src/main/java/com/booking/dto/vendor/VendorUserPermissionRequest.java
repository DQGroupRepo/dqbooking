package com.booking.dto.vendor;

import com.booking.model.enums.VendorPage;
import lombok.Data;

import java.util.Set;

@Data
public class VendorUserPermissionRequest {

    private Set<VendorPage> viewPages;

    private Set<VendorPage> editPages;
}