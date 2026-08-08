package com.booking.util;

import com.booking.BookingBackendApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {

        ApplicationContext context =
                SpringApplication.run(BookingBackendApplication.class, args);

        PasswordEncoder encoder =
                context.getBean(PasswordEncoder.class);

        System.out.println(encoder.encode("Admin@123"));

        SpringApplication.exit(context);
    }
}