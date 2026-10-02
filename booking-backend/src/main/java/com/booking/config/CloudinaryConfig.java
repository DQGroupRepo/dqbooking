package com.booking.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!prod")
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {

        return new Cloudinary(

                ObjectUtils.asMap(

                        "cloud_name",
                        /*System.getenv("CLOUDINARY_CLOUD_NAME")*/"zuedzhrj",

                        "api_key",
                        /*System.getenv("CLOUDINARY_API_KEY")*/"242688165783559",

                        "api_secret",
                        /*System.getenv("CLOUDINARY_API_SECRET")*/"S7a4OdWt00o-zGCCsH54er05-7Y",

                        "secure",
                        true

                )

        );

    }

}