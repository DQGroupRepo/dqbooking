package com.booking.config;

import com.booking.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // ==========================
                // CORS
                // ==========================

                .cors(Customizer.withDefaults())


                // ==========================
                // CSRF
                // ==========================

                .csrf(csrf ->
                        csrf.disable()
                )


                // ==========================
                // Stateless JWT Session
                // ==========================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // ==========================
                // Authorization
                // ==========================

                .authorizeHttpRequests(auth -> auth


                        // --------------------------------
                        // Public APIs
                        // --------------------------------

                        .requestMatchers(
                                "/api/health",
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/vendor/register",
                                "/api/customer/services",
                                "/api/customer/services/**",
                                "/uploads/**",
                                "/api/pricing/**"
                        )
                        .permitAll()


                        // --------------------------------
                        // Public GET APIs
                        // --------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/vendor/listings/**",
                                "/api/services/*/availability",
                                "/api/services/*/availability/*"
                        )
                        .permitAll()


                        // --------------------------------
                        // Vendor APIs
                        // --------------------------------

                        .requestMatchers(
                                "/api/vendor/**",
                                "/api/bookings/vendor",
                                "/api/bundles/vendor"
                        )
                        .hasAnyRole(
                                "VENDOR_ADMIN",
                                "VENDOR_USER",
                                "ADMIN"
                        )


                        // --------------------------------
                        // Customer Booking APIs
                        // --------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/bookings"
                        )
                        .hasAnyRole(
                                "CUSTOMER",
                                "VENDOR_ADMIN",
                                "VENDOR_USER",
                                "ADMIN"
                        )


                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/bookings/customer"
                        )
                        .hasRole("CUSTOMER")


                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/bookings/*/cancel"
                        )
                        .hasRole("CUSTOMER")


                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/bookings/*/cancellation-preview"
                        )
                        .hasRole("CUSTOMER")


                        // --------------------------------
                        // Booking Details / Groups
                        // --------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/bookings/*/details"
                        )
                        .hasAnyRole(
                                "CUSTOMER",
                                "VENDOR_ADMIN",
                                "VENDOR_USER",
                                "ADMIN"
                        )


                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/bookings/*"
                        )
                        .hasAnyRole(
                                "CUSTOMER",
                                "VENDOR_ADMIN",
                                "VENDOR_USER",
                                "ADMIN"
                        )


                        // --------------------------------
                        // Customer APIs
                        // --------------------------------

                        .requestMatchers(
                                "/api/customer/**",
                                "/api/reviews"
                        )
                        .hasRole("CUSTOMER")


                        // --------------------------------
                        // Admin APIs
                        // --------------------------------

                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole("ADMIN")


                        // --------------------------------
                        // Vendor Bookings
                        // --------------------------------

                        .requestMatchers(
                                "/api/vendor/bookings/**"
                        )
                        .hasAnyRole(
                                "VENDOR_ADMIN",
                                "VENDOR_USER",
                                "ADMIN"
                        )


                        // --------------------------------
                        // Everything else
                        // --------------------------------

                        .anyRequest()
                        .authenticated()

                )


                // ==========================
                // Exception Handling
                // ==========================

                .exceptionHandling(exception -> exception


                        // --------------------------------
                        // 401 - Authentication Required
                        // --------------------------------
                        //
                        // Used when the request is not
                        // authenticated or authentication
                        // cannot be established.
                        //

                        .authenticationEntryPoint(
                                (request, response, authException) -> {

                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );

                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.getWriter().write(
                                            "{\"message\":\"Authentication required\"}"
                                    );

                                }
                        )


                        // --------------------------------
                        // 403 - Access Denied
                        // --------------------------------
                        //
                        // Used when the user is authenticated
                        // but does not have the required role
                        // or permission at the Spring Security
                        // authorization layer.
                        //

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {

                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );

                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.getWriter().write(
                                            "{\"message\":\"You do not have permission to perform this action.\"}"
                                    );

                                }
                        )

                )


                // ==========================
                // JWT Filter
                // ==========================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();

    }


    // ==========================
    // Password Encoder
    // ==========================

    @Bean
    PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }


    // ==========================
    // Authentication Manager
    // ==========================

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();

    }


    // ==========================
    // CORS Configuration
    // ==========================

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(

                List.of(

                        "http://localhost:5173",

                        "http://localhost:5174",

                        "https://venues-aaa-booking-frontend.vercel.app",
                        "https://venues-aaa-booking-frontend-em3u2oocb-venues-aaa.vercel.app",
                        "https://www.dqbooking.com"

                )

        );


        configuration.setAllowedMethods(

                List.of(

                        "GET",

                        "POST",

                        "PUT",

                        "DELETE",

                        "OPTIONS",

                        "PATCH"

                )

        );


        configuration.setAllowedHeaders(

                List.of("*")

        );


        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(

                "/**",

                configuration

        );


        return source;

    }

}