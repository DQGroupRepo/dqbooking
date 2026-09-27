package com.booking.service.impl;

import com.booking.dto.customer.VendorListingResponse;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.model.enums.VendorVerificationStatus;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.CustomerVendorService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerVendorServiceImpl
        implements CustomerVendorService {

    private static final Logger log =
            LoggerFactory.getLogger(CustomerVendorServiceImpl.class);

    private final UserRepository vendorRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final CustomerVendorMapper mapper;

    @Override
    public List<VendorListingResponse> getListings() {

        log.debug(
                "Customer vendor marketplace listings requested"
        );

        List<VendorListingResponse> response =
                new ArrayList<>();

        List<VendorService> services =
                vendorServiceRepository
                        .findByActiveTrueAndDeletedFalse()
                        .stream()
                        .filter(service ->
                                service.getModerationStatus()
                                        == ServiceModerationStatus.APPROVED
                        )
                        .toList();

        for (VendorService service : services) {

            User vendor =
                    vendorRepository
                            .findById(
                                    service.getVendorId()
                            )
                            .orElse(null);

            if (vendor == null) {

                log.debug(
                        "Skipping marketplace service because vendor no longer exists serviceId={} vendorId={}",
                        service.getId(),
                        service.getVendorId()
                );

                continue;
            }

            if (vendor.getVerificationStatus()
                    != VendorVerificationStatus.APPROVED) {

                continue;
            }

            response.add(
                    mapper.toListing(
                            vendor,
                            service
                    )
            );
        }

        log.info(
                "Customer vendor marketplace listings returned count={}",
                response.size()
        );

        return response;
    }
}