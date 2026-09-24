package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringMenuResponse {

    private String serviceId;

    private String vendorId;

    private List<CateringMenuItemResponse> items =
            new ArrayList<>();

}