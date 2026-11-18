package com.booking.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("prod")
public class CloudinaryConfig {

    @Value("${app.upload.path}")
    private String uploadPath;

    @Bean
    public Cloudinary cloudinary() {

        return new Cloudinary(uploadPath);

    }

}
