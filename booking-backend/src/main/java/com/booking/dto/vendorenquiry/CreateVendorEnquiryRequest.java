package com.booking.dto.vendorenquiry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateVendorEnquiryRequest {

    @NotBlank
    @Size(max = 120)
    private String customerName;

    @NotBlank
    @Size(min = 7, max = 20)
    private String contactNumber;

    @NotBlank
    private String serviceId;

    @NotNull
    private LocalDate eventDate;

    @Size(max = 2000)
    private String notes;

    private LocalDate followUpDate;
}
