package com.booking.model;

import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import com.booking.model.enums.VendorVerificationStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "users")
public class User extends BaseEntity {

    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phone;

    private Role role;

    private UserStatus status = UserStatus.ACTIVE;

    private LocalDateTime lastLogin;

    /** Server-side active login session used to invalidate replaced JWTs. */
    private String activeSessionId;

    /** Expiry of the active JWT session; prevents stale sessions blocking login. */
    private LocalDateTime activeSessionExpiresAt;

    /*
     * =========================================
     * VENDOR PROFILE
     * =========================================
     *
     * These fields are populated for vendor users,
     * including VENDOR_ADMIN and VENDOR_USER where applicable.
     */

    private String businessName;

    private String city;

    private String address;

    private String description;

    private VendorVerificationStatus verificationStatus =
            VendorVerificationStatus.PENDING;

    /**
     * Vendor identity relationship.
     *
     * CUSTOMER      -> null
     * ADMIN         -> null
     * VENDOR_ADMIN  -> null
     * VENDOR_USER   -> VendorAdmin User._id
     *
     * The VendorAdmin User._id itself is the
     * canonical vendorId used throughout the system.
     */
    private String vendorId;

    public String getFullName() {

        String first =
                firstName == null
                        ? ""
                        : firstName.trim();

        String last =
                lastName == null
                        ? ""
                        : lastName.trim();

        return (first + " " + last).trim();
    }
}