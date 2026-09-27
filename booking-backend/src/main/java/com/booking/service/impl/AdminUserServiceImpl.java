package com.booking.service.impl;

import com.booking.dto.admin.AdminUserResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.User;
import com.booking.repository.UserRepository;
import com.booking.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl
        implements AdminUserService {

    private static final Logger log =
            LoggerFactory.getLogger(AdminUserServiceImpl.class);

    private final UserRepository userRepository;

    @Override
    public List<AdminUserResponse> getUsers() {

        log.info("Admin requested all active users");

        List<AdminUserResponse> users =
                userRepository
                        .findByDeletedFalse()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Admin user list retrieved count={}",
                users.size()
        );

        return users;
    }

    @Override
    public AdminUserResponse getUser(
            String userId
    ) {

        log.info(
                "Admin requested user userId={}",
                userId
        );

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Admin requested non-existent user userId={}",
                                    userId
                            );

                            return new ResourceNotFoundException(
                                    "User not found"
                            );
                        });

        return toResponse(user);
    }

    private AdminUserResponse toResponse(
            User user
    ) {

        return AdminUserResponse.builder()

                .id(user.getId())

                .email(user.getEmail())

                .firstName(user.getFirstName())

                .lastName(user.getLastName())

                .phone(user.getPhone())

                .role(user.getRole())

                .status(user.getStatus())

                .lastLogin(user.getLastLogin())

                .createdAt(user.getCreatedTs())

                .active(user.getActive())

                .deleted(user.getDeleted())

                .build();
    }
}