package com.booking.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ServiceTag {
    private String type; // CATEGORY or LOCATION
    private String value; // display value
    private String normalizedName; // normalized search value
    private List<String> aliases = new ArrayList<>();
}
