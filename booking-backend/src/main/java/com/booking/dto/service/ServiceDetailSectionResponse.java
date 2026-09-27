package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServiceDetailSectionResponse {

    private String key;

    private String title;

    private List<ServiceAttributeResponse> attributes =
            new ArrayList<>();

}