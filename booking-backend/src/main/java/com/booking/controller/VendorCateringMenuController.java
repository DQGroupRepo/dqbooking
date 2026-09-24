package com.booking.controller;

import com.booking.dto.service.CateringMenuOptionResponse;
import com.booking.dto.service.CateringMenuRequest;
import com.booking.dto.service.CateringMenuResponse;
import com.booking.service.VendorCateringMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/services")
@RequiredArgsConstructor
public class VendorCateringMenuController {

    private final VendorCateringMenuService
            vendorCateringMenuService;


    /*
     * =========================================
     * GET CATERING MENU
     * =========================================
     */

    @GetMapping("/{serviceId}/catering-menu")
    public ResponseEntity<CateringMenuResponse> getMenu(
            @PathVariable String serviceId
    ) {

        return ResponseEntity.ok(
                vendorCateringMenuService.getMenu(
                        serviceId
                )
        );
    }


    /*
     * =========================================
     * UPDATE CATERING MENU
     * =========================================
     */

    @PutMapping("/{serviceId}/catering-menu")
    public ResponseEntity<CateringMenuResponse> updateMenu(
            @PathVariable String serviceId,
            @Valid @RequestBody CateringMenuRequest request
    ) {

        return ResponseEntity.ok(
                vendorCateringMenuService.updateMenu(
                        serviceId,
                        request
                )
        );
    }

    @GetMapping("/{serviceId}/catering-menu/options")
    public ResponseEntity<List<CateringMenuOptionResponse>> getMenuOptions(

            @PathVariable String serviceId,

            @RequestParam String cuisine,

            @RequestParam(required = false)
            String foodType

    ) {

        return ResponseEntity.ok(
                vendorCateringMenuService
                        .getMenuOptions(
                                serviceId,
                                cuisine,
                                foodType
                        )
        );

    }

}