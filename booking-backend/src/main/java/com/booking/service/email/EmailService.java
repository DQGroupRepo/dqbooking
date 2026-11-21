package com.booking.service.email;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final ObjectProvider<JavaMailSender> senderProvider;
    @Value("${spring.mail.username:contact@dqbooking.com}") private String from;

    public void sendOtp(String recipient, String otp) {
        JavaMailSender sender = senderProvider.getIfAvailable();
        if (sender == null) throw new IllegalStateException("Email service is not configured. Set SMTP environment variables.");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("DQBooking password reset verification");
        message.setText("Your DQBooking password reset OTP is " + otp + ". It expires in 10 minutes. If you did not request this, please ignore this email.");
        sender.send(message);
    }

    public void sendPasswordChanged(String recipient) {
        JavaMailSender sender = senderProvider.getIfAvailable();
        if (sender == null) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from); message.setTo(recipient);
        message.setSubject("Your DQBooking password was changed");
        message.setText("Your DQBooking account password was changed. If you did not make this change, contact DQBooking support immediately.");
        try { sender.send(message); } catch (RuntimeException ignored) { /* Password is already safely changed; confirmation email is best-effort. */ }
    }
}
