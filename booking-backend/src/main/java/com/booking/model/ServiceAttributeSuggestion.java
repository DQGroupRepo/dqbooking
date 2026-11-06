package com.booking.model;

import com.booking.model.enums.ServiceAttributeType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "service_attribute_directory")
public class ServiceAttributeSuggestion {
    @Id
    private String id;
    private String category;
    private ServiceAttributeType type;
    private String name;
    private String normalizedName;
    private boolean active = true;
    private boolean systemDefined = true;
    private String approvalStatus = "APPROVED";
    private int displayOrder;
}
