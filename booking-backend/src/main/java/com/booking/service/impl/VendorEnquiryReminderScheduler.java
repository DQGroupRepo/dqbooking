package com.booking.service.impl;

import com.booking.model.VendorEnquiry;
import com.booking.model.enums.NotificationType;
import com.booking.repository.VendorEnquiryRepository;
import com.booking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class VendorEnquiryReminderScheduler {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");

    private final VendorEnquiryRepository enquiryRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 5 * * *", zone = "Asia/Kolkata")
    public void sendMorningFollowUpReminders() {
        processDueReminders("05:00");
    }

    @Scheduled(cron = "0 0 13 * * *", zone = "Asia/Kolkata")
    public void sendAfternoonFollowUpReminders() {
        processDueReminders("13:00");
    }

    private void processDueReminders(String runLabel) {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        LocalDateTime sentAt = LocalDateTime.now(BUSINESS_ZONE);

        List<VendorEnquiry> due = enquiryRepository
                .findByFollowUpDateLessThanEqualAndReminderSentAtIsNullOrderByFollowUpDateAsc(today);

        int sentCount = 0;

        for (VendorEnquiry candidate : due) {
            /*
             * Atomically claim the reminder before creating its notification.
             * This prevents two application instances or overlapping scheduler
             * executions from creating duplicate reminders for one enquiry.
             */
            Query claimQuery = Query.query(
                    Criteria.where("id").is(candidate.getId())
                            .and("reminderSentAt").is(null)
            );

            Update claimUpdate = new Update().set("reminderSentAt", sentAt);

            VendorEnquiry claimed = mongoTemplate.findAndModify(
                    claimQuery,
                    claimUpdate,
                    FindAndModifyOptions.options().returnNew(true),
                    VendorEnquiry.class
            );

            if (claimed == null) {
                continue;
            }

            try {
                String message = "Follow up with "
                        + claimed.getCustomerName()
                        + " ("
                        + claimed.getContactNumber()
                        + ") regarding "
                        + claimed.getServiceName()
                        + ". Event date: "
                        + claimed.getEventDate()
                        + ".";

                notificationService.createNotification(
                        claimed.getVendorId(),
                        NotificationType.SYSTEM,
                        "Enquiry follow-up reminder",
                        message,
                        claimed.getId()
                );

                sentCount++;
            } catch (Exception ex) {
                /*
                 * reminderSentAt remains set to avoid duplicate notifications.
                 * The failure is logged for operational investigation.
                 */
                log.error(
                        "Failed to create enquiry reminder notification enquiryId={} vendorId={}",
                        claimed.getId(), claimed.getVendorId(), ex
                );
            }
        }

        log.info(
                "Enquiry reminder run completed run={} date={} dueCount={} sentCount={}",
                runLabel, today, due.size(), sentCount
        );
    }
}
