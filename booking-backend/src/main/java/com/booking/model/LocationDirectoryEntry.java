package com.booking.model;
import lombok.Getter; import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Getter @Setter @Document("location_directory")
public class LocationDirectoryEntry { @Id private String id; private String state = "Kerala"; private String district; private String name; private String normalizedName; private boolean active = true; private boolean systemDefined = true; }
