package com.booking.model;

import com.booking.model.embedded.CancellationPolicy;
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
     * =========================================
     * CANCELLATION POLICY
     * =========================================
     */

    private CancellationPolicy cancellationPolicy =
            new CancellationPolicy();

    private Boolean instantBooking = false;

}