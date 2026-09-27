package com.booking.service.impl;

import com.booking.dto.vendor.VendorTeamMemberRequest;
import com.booking.dto.vendor.VendorTeamMemberResponse;
import com.booking.dto.vendor.VendorUserPermissionRequest;
import com.booking.model.User;
import com.booking.model.VendorUserPermission;
import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import com.booking.model.enums.VendorPage;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorUserPermissionRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorAccountService;
import com.booking.service.VendorTeamService;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorTeamServiceImpl
        implements VendorTeamService {

    private final UserRepository userRepository;

    private final VendorUserPermissionRepository
            permissionRepository;

    private final VendorAccessService
            vendorAccessService;

    private final VendorAccountService
            vendorAccountService;

    private final PasswordEncoder passwordEncoder;

    @Override
    public VendorTeamMemberResponse createVendorUser(
            VendorTeamMemberRequest request
    ) {

        requireVendorTeamManager();

        if (request == null) {

            log.warn("Vendor user creation rejected because request is null");

            throw new IllegalArgumentException(
                    "Request is required."
            );
        }

        if (isBlank(request.getFirstName())) {

            log.warn("Vendor user creation rejected because first name is missing");

            throw new IllegalArgumentException(
                    "First name is required."
            );
        }

        if (isBlank(request.getEmail())) {

            log.warn("Vendor user creation rejected because email is missing");

            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        if (isBlank(request.getPassword())) {

            log.warn("Vendor user creation rejected because password is missing");

            throw new IllegalArgumentException(
                    "Password is required."
            );
        }

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        log.info(
                "Creating vendor user vendorId={}",
                vendorId
        );

        vendorAccountService
                .checkVendorUserLimit(
                        vendorId
                );

        if (userRepository
                .findByEmail(
                        request.getEmail()
                )
                .isPresent()) {

            log.warn(
                    "Vendor user creation rejected because email already exists vendorId={}",
                    vendorId
            );

            throw new IllegalArgumentException(
                    "A user with this email already exists."
            );
        }

        User user =
                new User();

        user.setFirstName(
                request.getFirstName()
        );

        user.setLastName(
                request.getLastName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(
                Role.VENDOR_USER
        );

        user.setVendorId(
                vendorId
        );

        user.setStatus(
                UserStatus.ACTIVE
        );

        user.setActive(
                true
        );

        user =
                userRepository.save(
                        user
                );

        Set<VendorPage> viewPages =
                request.getViewPages() == null
                        ? new HashSet<>()
                        : new HashSet<>(
                        request.getViewPages()
                );

        Set<VendorPage> editPages =
                request.getEditPages() == null
                        ? new HashSet<>()
                        : new HashSet<>(
                        request.getEditPages()
                );

        viewPages.addAll(
                editPages
        );

        VendorUserPermission permission =
                VendorUserPermission.builder()
                        .userId(
                                user.getId()
                        )
                        .vendorId(
                                vendorId
                        )
                        .viewPages(
                                viewPages
                        )
                        .editPages(
                                editPages
                        )
                        .build();

        permissionRepository.save(
                permission
        );

        log.info(
                "Vendor user created userId={} vendorId={}",
                user.getId(),
                vendorId
        );

        return buildResponse(
                user,
                permission
        );
    }

    @Override
    public List<VendorTeamMemberResponse>
    getTeamMembers() {

        requireVendorTeamManager();

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        List<VendorTeamMemberResponse> members =
                userRepository
                        .findByVendorIdAndRole(
                                vendorId,
                                Role.VENDOR_USER
                        )
                        .stream()
                        .map(
                                this::buildResponse
                        )
                        .toList();

        log.info(
                "Retrieved vendor team members vendorId={} memberCount={}",
                vendorId,
                members.size()
        );

        return members;
    }

    @Override
    public VendorTeamMemberResponse getTeamMember(
            String userId
    ) {

        requireVendorTeamManager();

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User user =
                findVendorUser(
                        userId,
                        vendorId
                );

        log.info(
                "Retrieved vendor team member userId={} vendorId={}",
                userId,
                vendorId
        );

        return buildResponse(
                user
        );
    }

    @Override
    public VendorTeamMemberResponse updateVendorUser(
            String userId,
            VendorTeamMemberRequest request
    ) {

        requireVendorTeamManager();

        if (request == null) {

            log.warn(
                    "Vendor user update rejected because request is null userId={}",
                    userId
            );

            throw new IllegalArgumentException(
                    "Request is required."
            );
        }

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User user =
                findVendorUser(
                        userId,
                        vendorId
                );

        if (!isBlank(
                request.getFirstName()
        )) {

            user.setFirstName(
                    request.getFirstName()
            );
        }

        if (!isBlank(
                request.getLastName()
        )) {

            user.setLastName(
                    request.getLastName()
            );
        }

        if (!isBlank(
                request.getPhone()
        )) {

            user.setPhone(
                    request.getPhone()
            );
        }

        if (!isBlank(
                request.getEmail()
        ) &&
                !request.getEmail()
                        .equalsIgnoreCase(
                                user.getEmail()
                        )) {

            if (userRepository
                    .findByEmail(
                            request.getEmail()
                    )
                    .isPresent()) {

                log.warn(
                        "Vendor user update rejected because email already exists userId={} vendorId={}",
                        userId,
                        vendorId
                );

                throw new IllegalArgumentException(
                        "A user with this email already exists."
                );
            }

            user.setEmail(
                    request.getEmail()
            );
        }

        if (!isBlank(
                request.getPassword()
        )) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        user =
                userRepository.save(
                        user
                );

        log.info(
                "Vendor user updated userId={} vendorId={}",
                userId,
                vendorId
        );

        return buildResponse(
                user
        );
    }

    @Override
    public VendorTeamMemberResponse
    updateVendorUserStatus(
            String userId,
            boolean active
    ) {

        requireVendorTeamManager();

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User user =
                findVendorUser(
                        userId,
                        vendorId
                );

        user.setActive(
                active
        );

        user =
                userRepository.save(
                        user
                );

        log.info(
                "Vendor user status updated userId={} vendorId={} active={}",
                userId,
                vendorId,
                active
        );

        return buildResponse(
                user
        );
    }

    @Override
    public void deleteVendorUser(
            String userId
    ) {

        requireVendorTeamManager();

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User user =
                findVendorUser(
                        userId,
                        vendorId
                );

        permissionRepository
                .deleteByUserId(
                        user.getId()
                );

        userRepository.delete(
                user
        );

        log.info(
                "Vendor user deleted userId={} vendorId={}",
                userId,
                vendorId
        );
    }

    @Override
    public void updatePermissions(
            String userId,
            VendorUserPermissionRequest request
    ) {

        requireVendorTeamManager();

        if (request == null) {

            log.warn(
                    "Vendor permission update rejected because request is null userId={}",
                    userId
            );

            throw new IllegalArgumentException(
                    "Permission request is required."
            );
        }

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User user =
                findVendorUser(
                        userId,
                        vendorId
                );

        Set<VendorPage> viewPages =
                request.getViewPages() == null
                        ? new HashSet<>()
                        : new HashSet<>(
                        request.getViewPages()
                );

        Set<VendorPage> editPages =
                request.getEditPages() == null
                        ? new HashSet<>()
                        : new HashSet<>(
                        request.getEditPages()
                );

        viewPages.addAll(
                editPages
        );

        VendorUserPermission permission =
                permissionRepository
                        .findByUserIdAndVendorId(
                                user.getId(),
                                vendorId
                        )
                        .orElse(
                                VendorUserPermission
                                        .builder()
                                        .userId(
                                                user.getId()
                                        )
                                        .vendorId(
                                                vendorId
                                        )
                                        .build()
                        );

        permission.setViewPages(
                viewPages
        );

        permission.setEditPages(
                editPages
        );

        permissionRepository.save(
                permission
        );

        log.info(
                "Vendor user permissions updated userId={} vendorId={} viewCount={} editCount={}",
                userId,
                vendorId,
                viewPages.size(),
                editPages.size()
        );
    }

    private void requireVendorTeamManager() {

        User currentUser =
                SecurityUtil.getCurrentUser();

        if (
                currentUser.getRole()
                        == Role.VENDOR_ADMIN
        ) {

            return;
        }

        if (
                currentUser.getRole()
                        == Role.ADMIN
        ) {

            vendorAccessService
                    .getEffectiveVendorId();

            return;
        }

        log.warn(
                "Vendor team management access denied userId={} role={}",
                currentUser.getId(),
                currentUser.getRole()
        );

        throw new AccessDeniedException(
                "Only VendorAdmin or Admin in Support Mode can manage team members."
        );
    }

    private User findVendorUser(
            String userId,
            String vendorId
    ) {

        User user =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Vendor user not found userId={} vendorId={}",
                                    userId,
                                    vendorId
                            );

                            return new IllegalArgumentException(
                                    "VendorUser not found."
                            );
                        });

        if (user.getRole()
                != Role.VENDOR_USER) {

            log.warn(
                    "Vendor team access denied because target is not a VendorUser userId={} role={}",
                    userId,
                    user.getRole()
            );

            throw new AccessDeniedException(
                    "This user is not a VendorUser."
            );
        }

        if (!vendorId.equals(
                user.getVendorId()
        )) {

            log.warn(
                    "Vendor team access denied due to vendor ownership mismatch userId={} vendorId={}",
                    userId,
                    vendorId
            );

            throw new AccessDeniedException(
                    "Access denied."
            );
        }

        return user;
    }

    private VendorTeamMemberResponse
    buildResponse(
            User user
    ) {

        VendorUserPermission permission =
                permissionRepository
                        .findByUserId(
                                user.getId()
                        )
                        .orElse(null);

        return buildResponse(
                user,
                permission
        );
    }

    private VendorTeamMemberResponse
    buildResponse(
            User user,
            VendorUserPermission permission
    ) {

        Set<VendorPage> viewPages =
                permission == null ||
                        permission.getViewPages() == null

                        ? new HashSet<>()

                        : new HashSet<>(
                        permission.getViewPages()
                );

        Set<VendorPage> editPages =
                permission == null ||
                        permission.getEditPages() == null

                        ? new HashSet<>()

                        : new HashSet<>(
                        permission.getEditPages()
                );

        viewPages.addAll(
                editPages
        );

        return VendorTeamMemberResponse
                .builder()
                .id(
                        user.getId()
                )
                .fullName(
                        user.getFullName()
                )
                .email(
                        user.getEmail()
                )
                .phone(
                        user.getPhone()
                )
                .role(
                        user.getRole()
                )
                .vendorId(
                        user.getVendorId()
                )
                .active(
                        user.getActive()
                )
                .viewPages(
                        viewPages
                )
                .editPages(
                        editPages
                )
                .build();
    }

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.isBlank();
    }
}
