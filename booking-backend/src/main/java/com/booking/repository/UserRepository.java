package com.booking.repository;

import com.booking.model.User;
import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import com.booking.model.enums.VendorVerificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    long countByRole(Role role);

    long countByRoleAndStatus(Role role, UserStatus status);

    List<User> findByRoleAndStatus(
            Role role,
            UserStatus status
    );

    List<User> findByDeletedFalse();

    List<User> findByRoleAndDeletedFalse(
            Role role
    );

    List<User> findByRoleAndVerificationStatus(
            Role role,
            VendorVerificationStatus verificationStatus
    );

    List<User> findByRole(Role role);

    long countByRoleAndVerificationStatus(
            Role role,
            VendorVerificationStatus verificationStatus
    );
}