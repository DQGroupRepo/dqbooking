package com.booking.controller;

import com.booking.dto.bookingslot.BookingSlotResponse;
import com.booking.dto.bookingslot.CreateBookingSlotRequest;
import com.booking.dto.bookingslot.UpdateBookingSlotRequest;
import com.booking.dto.bookingslot.UpdateBookingSlotStatusRequest;
import com.booking.service.BookingSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/services/{serviceId}/slots")
@RequiredArgsConstructor
public class BookingSlotController {

    private final BookingSlotService bookingSlotService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingSlotResponse createSlot(
            @PathVariable String serviceId,
            @Valid @RequestBody CreateBookingSlotRequest request) {

        return bookingSlotService.createSlot(serviceId, request);
    }

    @GetMapping
    public List<BookingSlotResponse> getSlots(
            @PathVariable String serviceId) {

        return bookingSlotService.getSlots(serviceId);
    }

    @GetMapping("/{slotId}")
    public BookingSlotResponse getSlot(
            @PathVariable String slotId) {

        return bookingSlotService.getSlot(slotId);
    }

    @PutMapping("/{slotId}")
    public BookingSlotResponse updateSlot(
            @PathVariable String slotId,
            @Valid @RequestBody UpdateBookingSlotRequest request) {

        return bookingSlotService.updateSlot(slotId, request);
    }

    @DeleteMapping("/{slotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSlot(
            @PathVariable String slotId) {

        bookingSlotService.deleteSlot(slotId);
    }

    @PatchMapping("/{slotId}/status")
    public BookingSlotResponse changeStatus(

            @PathVariable String slotId,

            @RequestBody UpdateBookingSlotStatusRequest request) {

        return bookingSlotService.changeStatus(
                slotId,
                request.getActive()
        );
    }

}