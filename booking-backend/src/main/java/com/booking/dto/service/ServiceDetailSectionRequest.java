package com.booking.dto.service;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServiceDetailSectionRequest {

    private String key;

    private String title;

    @Valid
    private List<ServiceAttributeRequest> attributes =
            new ArrayList<>();

}