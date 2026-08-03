package com.booking.repository;

import com.booking.model.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentTransactionRepository
        extends MongoRepository<PaymentTransaction, String> {

    List<PaymentTransaction> findByBookingId(String bookingId);

    List<PaymentTransaction> findByCustomerId(String customerId);

    List<PaymentTransaction> findByVendorId(String vendorId);

}