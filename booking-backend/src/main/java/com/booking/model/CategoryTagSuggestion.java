package com.booking.model;
import lombok.Getter; import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Getter @Setter @Document("category_tags")
public class CategoryTagSuggestion { @Id private String id; private String parentCategory; private String name; private String normalizedName; private boolean active = true; private boolean systemDefined = true; }
