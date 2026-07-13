package com.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BookingBackendApplication {

    public static void main(String[] args) {

		SpringApplication.run(BookingBackendApplication.class, args);
	}

}
