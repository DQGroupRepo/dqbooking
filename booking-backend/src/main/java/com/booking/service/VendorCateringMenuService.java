package com.booking.service;

import com.booking.dto.service.CateringMenuOptionResponse;
import com.booking.dto.service.CateringMenuRequest;
import com.booking.dto.service.CateringMenuResponse;

import java.util.List;

public interface VendorCateringMenuService {

    CateringMenuResponse getMenu(
            String serviceId
    );

    CateringMenuResponse updateMenu(
            String serviceId,
            CateringMenuRequest request
    );

    List<CateringMenuOptionResponse> getMenuOptions(
            String serviceId,
            String cuisine,
            String foodType
    );

}