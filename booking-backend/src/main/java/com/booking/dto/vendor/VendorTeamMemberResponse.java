package com.booking.dto.vendor;

import com.booking.model.enums.Role;
import com.booking.model.enums.VendorPage;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class VendorTeamMemberResponse {

    private String id;

    private String fullName;

    private String email;

    private String phone;

    private Role role;

    private String vendorId;

    private boolean active;

    private Set<VendorPage> viewPages;

    private Set<VendorPage> editPages;
}