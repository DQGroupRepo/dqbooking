package com.booking.dto.auth;
import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Pattern; import lombok.Data;
@Data public class ChangePasswordRequest { @NotBlank private String currentPassword; @NotBlank @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$", message="Password must contain at least 8 characters, uppercase, lowercase, number and special character") private String newPassword; }
