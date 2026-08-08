package com.booking.service.impl;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.exception.ServiceNotFoundException;
import com.booking.exception.VendorNotFoundException;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.enums.ServiceCategory;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository vendorRepository;

    private final CustomerVendorMapper customerVendorMapper;

    @Override
    public VendorDetailResponse getServiceById(
            String serviceId
    ) {

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new ServiceNotFoundException(serviceId));

        User vendor =
                vendorRepository
                        .findById(service.getVendorId())
                        .orElseThrow(() ->
                                new VendorNotFoundException(
                                        service.getVendorId()
                                ));

        return customerVendorMapper.toDetail(
                vendor,
                service
        );

    }

    @Override
    public List<VendorListingResponse> getVendorListings(
            String category
    ) {

        List<VendorService> services;

        if (category == null || category.isBlank()) {

            services =
                    vendorServiceRepository
                            .findByActiveTrueAndDeletedFalse();

        } else {

            services =
                    vendorServiceRepository
                            .findByCategoryAndActiveTrueAndDeletedFalse(
                                    ServiceCategory.valueOf(
                                            category.toUpperCase()
                                    )
                            );

        }

        return services.stream()
                .map(service -> {

                    User vendor =
                            vendorRepository
                                    .findById(service.getVendorId())
                                    .orElseThrow(() ->
                                            new VendorNotFoundException(
                                                    service.getVendorId()
                                            ));

                    return customerVendorMapper.toListing(
                            vendor,
                            service
                    );

                })
                .toList();

    }
}
