package com.booking.service.impl;

import com.booking.dto.vendor.BankDetailsRequest;
import com.booking.dto.vendor.BankDetailsResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.BookingSlot;
import com.booking.model.VendorService;
import com.booking.service.BankDetailsService;

public class BankDetailsServiceImpl implements BankDetailsService {
    @Override
    public BankDetailsResponse insertBankDetails(String ServiceId,BankDetailsRequest request)
    {

        log.info(
                "Inserting Bank details of serviceId",
                serviceId,
                request.getSlotName()
        );

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> {

                    log.warn(
                            "Cannot create booking slot. Service not found serviceId={}",
                            serviceId
                    );

                    return new ResourceNotFoundException(
                            "Vendor Service not found."
                    );
                });

        validateSlot(request, serviceId);

        BookingSlot bookingSlot =
                bookingSlotMapper.toEntity(request);

        bookingSlot.setServiceId(service.getId());

        bookingSlot.setActive(true);

        bookingSlot =
                bookingSlotRepository.save(bookingSlot);

        log.info(
                "Booking slot created slotId={} serviceId={} slotName={}",
                bookingSlot.getId(),
                serviceId,
                bookingSlot.getSlotName()
        );

        return bookingSlotMapper.toResponse(bookingSlot);
    }
}
