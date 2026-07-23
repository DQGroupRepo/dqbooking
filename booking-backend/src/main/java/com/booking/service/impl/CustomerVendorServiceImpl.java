package com.booking.service.impl;

import com.booking.dto.customer.VendorListingResponse;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.model.Vendor;
import com.booking.model.VendorService;
import com.booking.repository.VendorRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.CustomerVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerVendorServiceImpl
        implements CustomerVendorService {

    private final VendorRepository vendorRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final CustomerVendorMapper mapper;

    @Override
    public List<VendorListingResponse> getListings() {

        List<VendorListingResponse> response =
                new ArrayList<>();

        List<VendorService> services =
                vendorServiceRepository
                        .findByActiveTrueAndDeletedFalse();

        for (VendorService service : services) {

            Vendor vendor =
                    vendorRepository
                            .findById(service.getVendorId())
                            .orElse(null);

            if (vendor == null) {
                continue;
            }

            response.add(
                    mapper.toListing(vendor, service)
            );
        }

        return response;

    }

}