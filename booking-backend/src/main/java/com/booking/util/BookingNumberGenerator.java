package com.booking.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;
/// @TODO Need to update this using MongoDB Sequence Collection or UUID
@Component
public class BookingNumberGenerator {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd");

    private final AtomicInteger sequence = new AtomicInteger(1);

    public String generate() {

        return "BK-"
                + LocalDate.now().format(FORMATTER)
                + "-"
                + String.format("%04d", sequence.getAndIncrement());
    }

}