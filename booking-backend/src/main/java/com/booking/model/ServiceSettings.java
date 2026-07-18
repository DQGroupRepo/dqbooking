package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "service_settings")
public class ServiceSettings extends BaseEntity {

    private String serviceId;

    /*
     * Booking Rules
     */
    private Integer minimumAdvanceDays;

    private Integer maximumAdvanceDays;

    private Integer minimumGuests;

    private Integer maximumGuests;

    /*
     * Payment Rules
     */
    private Integer depositPercentage;

    private Integer balanceDueDays;

    /*
     * Cancellation Policy
     */
    private Integer freeCancellationDays;

    private Integer cancellationFeePercentage;

    /*
     * Visibility
     */
    private Boolean active = true;

    private Boolean instantBooking = false;

}