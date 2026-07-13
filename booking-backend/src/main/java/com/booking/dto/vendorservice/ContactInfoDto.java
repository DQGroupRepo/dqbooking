package com.booking.dto.vendorservice;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactInfoDto {

    @NotBlank
    private String contactPerson;

    @NotBlank
    private String mobile;

    @Email
    private String email;

}