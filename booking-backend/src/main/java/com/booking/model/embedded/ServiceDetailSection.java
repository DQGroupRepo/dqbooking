package com.booking.model.embedded;

import com.booking.model.ServiceAttribute;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServiceDetailSection {

    /*
     * Technical identifier for the section.
     *
     * Examples:
     *
     * capacityDetails
     * venueFacilities
     * photographyDetails
     * equipment
     * decorationDetails
     */
    private String key;


    /*
     * Human-readable section title.
     *
     * Examples:
     *
     * Capacity Details
     * Venue Facilities
     * Photography Details
     * Equipment
     */
    private String title;


    /*
     * Generic attributes belonging
     * to this section.
     */
    private List<ServiceAttribute> attributes =
            new ArrayList<>();

}