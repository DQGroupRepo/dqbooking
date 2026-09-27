package com.booking.dto.service;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringMenuRequest {

    @Valid
    private List<CateringMenuItemRequest> items = new ArrayList<>();

}