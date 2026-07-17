package com.booking.model;

import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
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

    public String getFullName() {

        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();

        return (first + " " + last).trim();

    }

}