package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** Configuration used only by MAKEUP (Beauty & Makeup) services. */
@Getter @Setter
public class BeautyDetails {
    private LocalTime openingTime;
    private LocalTime closingTime;
    /** Legacy persisted field; Beauty appointment starts now use a fixed 30-minute grid. */
    @Deprecated
    private Integer appointmentIntervalMinutes = 30;
    private List<BeautyServiceItem> services = new ArrayList<>();
    private List<BeautyDurationRule> durationRules = new ArrayList<>();
    private List<BeautyBreak> breaks = new ArrayList<>();
}
