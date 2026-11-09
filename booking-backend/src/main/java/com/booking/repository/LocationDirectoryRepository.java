package com.booking.repository;

import com.booking.model.LocationDirectoryEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LocationDirectoryRepository extends MongoRepository<LocationDirectoryEntry, String> {

    List<LocationDirectoryEntry> findByStateIgnoreCaseAndActiveTrueOrderByDistrictAscNameAsc(String state);

    List<LocationDirectoryEntry> findByStateIgnoreCaseAndDistrictIgnoreCaseAndActiveTrueOrderByNameAsc(
            String state,
            String district
    );

    LocationDirectoryEntry findFirstByStateIgnoreCaseAndDistrictIgnoreCaseAndNormalizedName(
            String state,
            String district,
            String normalizedName
    );
}
