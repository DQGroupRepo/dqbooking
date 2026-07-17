package com.booking.dto.vendorprofile;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateVendorProfileRequest {

    @NotBlank
    private String businessName;

    @NotBlank
    private String ownerName;

    @NotBlank
    private String phone;

    @NotBlank
    private String city;

    @NotBlank
    private String address;

    private String description;

}