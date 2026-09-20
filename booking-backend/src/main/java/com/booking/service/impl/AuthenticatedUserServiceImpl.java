package com.booking.service.impl;

import com.booking.model.User;
import com.booking.model.enums.Role;
import com.booking.repository.UserRepository;
import com.booking.service.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserServiceImpl
        implements AuthenticatedUserService {

    @Override
    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof User user)) {

            throw new UsernameNotFoundException(
                    "Authenticated user not found."
            );
        }

        return user;
    }

    @Override
    public User getCurrentCustomer() {

        User user = getCurrentUser();

        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException(
                    "Customer access required."
            );
        }

        return user;
    }

    @Override
    public User getCurrentVendor() {

        User user = getCurrentUser();

        if (user.getRole() != Role.VENDOR_ADMIN &&
                user.getRole() != Role.VENDOR_USER) {

            throw new AccessDeniedException(
                    "Vendor access required."
            );
        }

        return user;
    }
}