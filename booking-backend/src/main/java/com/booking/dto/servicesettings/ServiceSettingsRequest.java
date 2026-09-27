package com.booking.dto.servicesettings;

import com.booking.dto.pricing.CancellationPolicyRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceSettingsRequest {

    private Integer minimumAdvanceDays;

    private Integer maximumAdvanceDays;

    private Integer minimumGuests;

    private Integer maximumGuests;

    private Integer depositPercentage;

    private Integer balanceDueDays;

    private CancellationPolicyRequest cancellationPolicy;

    private Boolean instantBooking;

}
