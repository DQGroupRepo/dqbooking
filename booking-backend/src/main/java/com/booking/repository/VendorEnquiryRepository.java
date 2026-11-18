package com.booking.repository;

import com.booking.model.VendorEnquiry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface VendorEnquiryRepository
        extends MongoRepository<VendorEnquiry, String> {

    List<VendorEnquiry> findByVendorIdAndEventDateOrderByCreatedTsDesc(
            String vendorId,
            LocalDate eventDate
    );

    List<VendorEnquiry> findByFollowUpDateLessThanEqualAndReminderSentAtIsNullOrderByFollowUpDateAsc(
            LocalDate followUpDate
    );
}
