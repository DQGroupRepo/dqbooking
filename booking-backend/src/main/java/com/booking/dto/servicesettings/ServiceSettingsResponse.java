package com.booking.dto.servicesettings;

import com.booking.dto.pricing.CancellationPolicyResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceSettingsResponse {

    private Integer minimumAdvanceDays;

    private Integer maximumAdvanceDays;

    private Integer minimumGuests;

    private Integer maximumGuests;

    private Integer depositPercentage;

    private Integer balanceDueDays;

    private CancellationPolicyResponse cancellationPolicy;

    private Boolean active;

    private Boolean instantBooking;

}
