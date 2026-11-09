package com.booking.repository;

import com.booking.model.ServiceAttributeSuggestion;
import com.booking.model.enums.ServiceAttributeType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ServiceAttributeSuggestionRepository
        extends MongoRepository<ServiceAttributeSuggestion, String> {
    List<ServiceAttributeSuggestion> findByCategoryAndTypeAndActiveTrueAndApprovalStatusOrderByDisplayOrderAscNameAsc(
            String category, ServiceAttributeType type, String approvalStatus);
    List<ServiceAttributeSuggestion> findByApprovalStatusOrderByCategoryAscTypeAscNameAsc(String approvalStatus);
    Optional<ServiceAttributeSuggestion> findFirstByCategoryAndTypeAndNormalizedName(
            String category, ServiceAttributeType type, String normalizedName);
}
