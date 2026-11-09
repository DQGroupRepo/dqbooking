package com.booking.dto.service;

import com.booking.model.embedded.ServiceResourceType;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class UpdateServiceResourceTypesRequest {
    @Valid
    private List<ServiceResourceType> resourceTypes = new ArrayList<>();
}
