package com.booking.config;

import com.booking.model.User;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.AuditorAware;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityAuditorAware
        implements AuditorAware<String> {


    private final UserRepository userRepository;


    @Override
    public Optional<String> getCurrentAuditor() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        /*
         * =========================================
         * NO AUTHENTICATED USER
         * =========================================
         */

        if (
                authentication == null ||
                        !authentication.isAuthenticated()
        ) {

            return Optional.empty();

        }


        /*
         * =========================================
         * ANONYMOUS USER
         * =========================================
         */

        if (
                "anonymousUser".equals(
                        authentication.getPrincipal()
                )
        ) {

            return Optional.empty();

        }


        /*
         * =========================================
         * AUTHENTICATED IDENTITY
         * =========================================
         *
         * Your existing application resolves the
         * authenticated user using the email identity.
         *
         * Therefore authentication.getName()
         * is used to locate the User document.
         */

        String identity =
                authentication.getName();


        if (
                identity == null ||
                        identity.isBlank()
        ) {

            return Optional.empty();

        }


        /*
         * =========================================
         * RESOLVE ACTUAL USER ID
         * =========================================
         */

        Optional<User> user =
                userRepository.findByEmail(
                        identity
                );


        return user
                .map(User::getId);

    }

}