package com.booking.scheduler;

import com.booking.model.BookingHold;
import com.booking.model.enums.BookingHoldStatus;
import com.booking.repository.BookingHoldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingHoldCleanupScheduler {

    private final BookingHoldRepository bookingHoldRepository;

    /*
     * =========================================
     * EXPIRE BOOKING HOLDS
     * =========================================
     *
     * Runs every 30 seconds.
     *
     * Any ACTIVE hold whose expiresAt has passed
     * is marked as EXPIRED.
     */
    @Scheduled(fixedDelay = 30_000)
    public void expireBookingHolds() {

        LocalDateTime now = LocalDateTime.now();

        List<BookingHold> expiredHolds =
                bookingHoldRepository
                        .findByStatusAndExpiresAtBefore(
                                BookingHoldStatus.ACTIVE,
                                now
                        );

        if (expiredHolds.isEmpty()) {
            return;
        }

        for (BookingHold hold : expiredHolds) {

            hold.setStatus(BookingHoldStatus.EXPIRED);
            hold.setReleasedAt(now);

            bookingHoldRepository.save(hold);

            log.info(
                    "Booking hold expired holdId={} serviceId={} slotId={} " +
                            "eventDate={} quantity={} expiresAt={}",
                    hold.getId(),
                    hold.getServiceId(),
                    hold.getSlotId(),
                    hold.getEventDate(),
                    hold.getQuantity(),
                    hold.getExpiresAt()
            );
        }

        log.info(
                "Booking hold cleanup completed expiredCount={}",
                expiredHolds.size()
        );
    }
}