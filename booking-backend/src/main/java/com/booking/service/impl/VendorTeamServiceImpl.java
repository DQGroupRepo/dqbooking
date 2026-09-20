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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
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


    /*
     * =========================================
     * CREATE VENDOR USER
     * =========================================
     */

    @Override
    public VendorTeamMemberResponse createVendorUser(
            VendorTeamMemberRequest request
    ) {

        requireVendorAdmin();


        if (request == null) {

            throw new IllegalArgumentException(
                    "Request is required."
            );
        }


        if (isBlank(request.getFirstName())) {

            throw new IllegalArgumentException(
                    "First name is required."
            );
        }


        if (isBlank(request.getEmail())) {

            throw new IllegalArgumentException(
                    "Email is required."
            );
        }


        if (isBlank(request.getPassword())) {

            throw new IllegalArgumentException(
                    "Password is required."
            );
        }


        /*
         * =========================================
         * EFFECTIVE VENDOR
         * =========================================
         * vendorId is the canonical VendorAdmin
         * User._id.
         */

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();


        /*
         * =========================================
         * CHECK PLAN LIMIT
         * =========================================
         */

        vendorAccountService
                .checkVendorUserLimit(
                        vendorId
                );


        /*
         * =========================================
         * CHECK EMAIL
         * =========================================
         */

        if (userRepository
                .findByEmail(
                        request.getEmail()
                )
                .isPresent()) {

            throw new IllegalArgumentException(
                    "A user with this email already exists."
            );
        }


        /*
         * =========================================
         * CREATE USER
         * =========================================
         */

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


        /*
         * IMPORTANT:
         *
         * VendorUser belongs to the VendorAdmin
         * identified by the canonical vendorId.
         */

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


        /*
         * =========================================
         * CREATE PERMISSIONS
         * =========================================
         */

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


        /*
         * Edit automatically grants View.
         */

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


        return buildResponse(
                user,
                permission
        );
    }


    /*
     * =========================================
     * GET TEAM MEMBERS
     * =========================================
     */

    @Override
    public List<VendorTeamMemberResponse>
    getTeamMembers() {

        requireVendorAdmin();


        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();


        return userRepository
                .findByVendorIdAndRole(
                        vendorId,
                        Role.VENDOR_USER
                )
                .stream()
                .map(
                        this::buildResponse
                )
                .toList();
    }


    /*
     * =========================================
     * GET ONE TEAM MEMBER
     * =========================================
     */

    @Override
    public VendorTeamMemberResponse getTeamMember(
            String userId
    ) {

        requireVendorAdmin();


        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();


        User user =
                findVendorUser(
                        userId,
                        vendorId
                );


        return buildResponse(
                user
        );
    }


    /*
     * =========================================
     * UPDATE VENDOR USER
     * =========================================
     */

    @Override
    public VendorTeamMemberResponse updateVendorUser(
            String userId,
            VendorTeamMemberRequest request
    ) {

        requireVendorAdmin();


        if (request == null) {

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


        /*
         * Email can be changed.
         */

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

                throw new IllegalArgumentException(
                        "A user with this email already exists."
                );
            }


            user.setEmail(
                    request.getEmail()
            );
        }


        /*
         * Password is optional during update.
         */

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


        return buildResponse(
                user
        );
    }


    /*
     * =========================================
     * ENABLE / DISABLE
     * =========================================
     */

    @Override
    public VendorTeamMemberResponse
    updateVendorUserStatus(
            String userId,
            boolean active
    ) {

        requireVendorAdmin();


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


        return buildResponse(
                user
        );
    }


    /*
     * =========================================
     * DELETE
     * =========================================
     */

    @Override
    public void deleteVendorUser(
            String userId
    ) {

        requireVendorAdmin();


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
    }


    /*
     * =========================================
     * UPDATE PERMISSIONS
     * =========================================
     */

    @Override
    public void updatePermissions(
            String userId,
            VendorUserPermissionRequest request
    ) {

        requireVendorAdmin();


        if (request == null) {

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


        /*
         * Edit automatically implies View.
         */

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
    }


    /*
     * =========================================
     * VENDOR ADMIN CHECK
     * =========================================
     */

    private void requireVendorAdmin() {

        User currentUser =
                SecurityUtil.getCurrentUser();


        if (currentUser.getRole()
                != Role.VENDOR_ADMIN) {

            throw new AccessDeniedException(
                    "Only VendorAdmin can manage team members."
            );
        }
    }


    /*
     * =========================================
     * FIND VENDOR USER
     * =========================================
     */

    private User findVendorUser(
            String userId,
            String vendorId
    ) {

        User user =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "VendorUser not found."
                                )
                        );


        if (user.getRole()
                != Role.VENDOR_USER) {

            throw new AccessDeniedException(
                    "This user is not a VendorUser."
            );
        }


        if (!vendorId.equals(
                user.getVendorId()
        )) {

            throw new AccessDeniedException(
                    "Access denied."
            );
        }


        return user;
    }


    /*
     * =========================================
     * RESPONSE
     * =========================================
     */

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


        /*
         * Always enforce Edit => View.
         */

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