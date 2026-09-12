package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceAttributeRequest {

    /*
     * Technical identifier.
     *
     * Examples:
     *
     * hallCapacity
     * diningCapacity
     * parking
     * cameraType
     * droneAvailable
     */
    private String key;


    /*
     * Attribute value.
     *
     * Examples:
     *
     * 500
     * true
     * false
     * DSLR
     */
    private String value;

}