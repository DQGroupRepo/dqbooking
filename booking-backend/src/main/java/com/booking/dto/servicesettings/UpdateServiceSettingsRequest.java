package com.booking.dto.servicesettings;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateServiceSettingsRequest {

    private Integer minimumAdvanceDays;

    private Integer maximumAdvanceDays;

    private Integer minimumGuests;

    private Integer maximumGuests;

    private Integer depositPercentage;

    private Integer balanceDueDays;

    private Integer freeCancellationDays;

    private Integer cancellationFeePercentage;

    private Boolean active;

    private Boolean instantBooking;

}
