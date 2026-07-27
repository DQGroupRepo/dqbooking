package com.booking.dto.register;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorRegisterResponse {

    private String userId;

    private String vendorId;

    private String email;

    private String businessName;

    private String message;

}