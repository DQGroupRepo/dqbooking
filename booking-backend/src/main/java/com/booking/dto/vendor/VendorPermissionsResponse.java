package com.booking.dto.vendor;

import com.booking.model.enums.VendorPage;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class VendorPermissionsResponse {

    private Set<VendorPage> viewPages;

    private Set<VendorPage> editPages;
}