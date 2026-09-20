package com.booking.config;

import com.booking.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

        @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174}")
        private String corsAllowedOrigins;

        @Bean
        SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http

                                // ==========================
                                // CORS
                                // ==========================

                                .cors(Customizer.withDefaults())

                                // ==========================
                                // CSRF
                                // ==========================

                                .csrf(csrf -> csrf.disable())

                                // ==========================
                                // Stateless JWT Session
                                // ==========================

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

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
                                                                "/api/pricing/**")
                                                .permitAll()

                                                // --------------------------------
                                                // Public GET APIs
                                                // --------------------------------

                                                // Anyone can browse vendors/services
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/vendor/listings/**")
                                                .permitAll()

                                                // --------------------------------
                                                // Vendor APIs
                                                // --------------------------------

                                                .requestMatchers(
                                                                "/api/vendor/**")
                                                .hasRole("VENDOR")

                                                // --------------------------------
                                                // Customer APIs
                                                // --------------------------------

                                                .requestMatchers(
                                                                "/api/customer/**",
                                                                "/api/bookings",
                                                                "/api/reviews")
                                                .hasRole("CUSTOMER")

                                                // --------------------------------
                                                // Admin APIs
                                                // --------------------------------

                                                .requestMatchers(
                                                                "/api/admin/**")
                                                .hasRole("ADMIN")

                                                // --------------------------------
                                                // Bookings
                                                // --------------------------------

                                                // For now, vendor booking management
                                                .requestMatchers(
                                                                "/api/vendor/bookings/**")
                                                .hasRole("VENDOR")

                                                // --------------------------------
                                                // Everything else
                                                // --------------------------------

                                                .anyRequest()
                                                .authenticated()

                                )

                                // ==========================
                                // JWT Filter
                                // ==========================
                                .exceptionHandling(exception -> exception

                                                .authenticationEntryPoint(
                                                                (request, response, authException) -> {

                                                                        response.setStatus(
                                                                                        HttpServletResponse.SC_UNAUTHORIZED);

                                                                        response.setContentType(
                                                                                        "application/json");

                                                                        response.getWriter().write(
                                                                                        "{\"message\":\"Authentication required\"}");

                                                                })

                                )

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

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
                        AuthenticationConfiguration configuration) throws Exception {

                return configuration.getAuthenticationManager();

        }

        // ==========================
        // CORS Configuration
        // ==========================

        @Bean
        CorsConfigurationSource corsConfigurationSource() {

                List<String> allowedOrigins = java.util.Arrays.stream(corsAllowedOrigins.split(","))
                                .map(String::trim)
                                .filter(origin -> !origin.isBlank())
                                .toList();

                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(allowedOrigins);

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

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(

                                "/**",

                                configuration

                );

                return source;

        }

}