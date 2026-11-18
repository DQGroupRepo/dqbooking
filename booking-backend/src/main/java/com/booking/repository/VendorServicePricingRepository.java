package com.booking.repository;

import com.booking.model.VendorServicePricing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendorServicePricingRepository
        extends MongoRepository<VendorServicePricing, String> {

   List<VendorServicePricing> findByServiceIdOrderByVersionDesc(
           String serviceId
   );

   @Query("""
        {
            "serviceId": ?0,
            "effectiveFrom": { "$lte": ?1 },
            "active": true,
            "deleted": false,
            "$or": [
                { "effectiveUntil": null },
                { "effectiveUntil": { "$gte": ?1 } }
            ]
        }
        """)
   List<VendorServicePricing> findApplicablePricing(
           String serviceId,
           LocalDate eventDate
   );

   Optional<VendorServicePricing> findTopByServiceIdOrderByVersionDesc(
           String serviceId
   );
}