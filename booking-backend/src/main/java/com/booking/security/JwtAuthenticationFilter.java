package com.booking.security;

import com.booking.config.LoggingContext;
import com.booking.model.User;
import com.booking.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        if (
                authHeader == null ||
                        !authHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String userId =
                jwtService.extractUserId(token);

        User user =
                userRepository
                        .findById(userId)
                        .orElse(null);

        if (
                user != null &&
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication() == null
        ) {

            UsernamePasswordAuthenticationToken authentication =

                    new UsernamePasswordAuthenticationToken(

                            user,

                            null,

                            List.of(

                                    new SimpleGrantedAuthority(

                                            "ROLE_"
                                                    + user
                                                    .getRole()
                                                    .name()

                                    )

                            )

                    );

            authentication.setDetails(

                    new WebAuthenticationDetailsSource()

                            .buildDetails(request)

            );

            SecurityContextHolder

                    .getContext()

                    .setAuthentication(authentication);

            /*
             * Logging context
             *
             * Adds authenticated user information to MDC
             * so it appears automatically in application logs.
             */
            LoggingContext.setUser(
                    user.getId(),
                    user.getRole().name()
            );

            /*
             * Set vendor logging context using the
             * canonical VendorAdmin User._id.
             *
             * VENDOR_ADMIN:
             *   vendorId = user's own _id
             *
             * VENDOR_USER:
             *   vendorId = user's vendorId
             */
            if (user.getRole().name().equals("VENDOR_ADMIN")) {

                LoggingContext.setVendorId(
                        user.getId()
                );

            } else if (
                    user.getRole().name().equals("VENDOR_USER")
                            && user.getVendorId() != null
            ) {

                LoggingContext.setVendorId(
                        user.getVendorId()
                );
            }
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}