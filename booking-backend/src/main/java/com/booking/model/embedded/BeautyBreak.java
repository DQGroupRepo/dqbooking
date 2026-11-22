package com.booking.model.embedded;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;
@Getter @Setter
public class BeautyBreak {
    private LocalTime startTime;
    private LocalTime endTime;
    private String label;
}
