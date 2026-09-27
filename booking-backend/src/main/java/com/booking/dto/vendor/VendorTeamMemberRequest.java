package com.booking.dto.vendor;

import com.booking.model.enums.VendorPage;
import lombok.Data;

import java.util.Set;

@Data
public class VendorTeamMemberRequest {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String password;

    private Set<VendorPage> viewPages;

    private Set<VendorPage> editPages;
}