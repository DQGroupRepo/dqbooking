package com.booking.dto.vendorservice;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateServiceStatusRequest {

    @NotNull
    private Boolean active;

}
