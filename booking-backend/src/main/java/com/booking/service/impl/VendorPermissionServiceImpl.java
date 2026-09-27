package com.booking.service.impl;

import com.booking.dto.vendor.VendorPermissionsResponse;
import com.booking.model.User;
import com.booking.model.VendorUserPermission;
import com.booking.model.enums.Role;
import com.booking.model.enums.VendorPage;
import com.booking.repository.VendorUserPermissionRepository;
import com.booking.service.VendorPermissionService;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorPermissionServiceImpl
        implements VendorPermissionService {

    private final VendorUserPermissionRepository
            permissionRepository;

    @Override
    public boolean canView(VendorPage page) {

        User user =
                SecurityUtil.getCurrentUser();

        if (user.getRole() == Role.VENDOR_ADMIN) {
            return true;
        }

        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        if (user.getRole() != Role.VENDOR_USER) {
            return false;
        }

        if (user.getVendorId() == null ||
                user.getVendorId().isBlank()) {
            return false;
        }

        VendorUserPermission permission =
                permissionRepository
                        .findByUserIdAndVendorId(
                                user.getId(),
                                user.getVendorId()
                        )
                        .orElse(null);

        if (permission == null) {
            return false;
        }

        if (permission.getEditPages() != null &&
                permission.getEditPages().contains(page)) {

            return true;
        }

        return permission.getViewPages() != null &&
                permission.getViewPages().contains(page);
    }

    @Override
    public boolean canEdit(VendorPage page) {

        User user =
                SecurityUtil.getCurrentUser();

        if (user.getRole() == Role.VENDOR_ADMIN) {
            return true;
        }

        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        if (user.getRole() != Role.VENDOR_USER) {
            return false;
        }

        if (user.getVendorId() == null ||
                user.getVendorId().isBlank()) {
            return false;
        }

        VendorUserPermission permission =
                permissionRepository
                        .findByUserIdAndVendorId(
                                user.getId(),
                                user.getVendorId()
                        )
                        .orElse(null);

        if (permission == null ||
                permission.getEditPages() == null) {
            return false;
        }

        return permission
                .getEditPages()
                .contains(page);
    }

    @Override
    public void checkView(
            VendorPage page
    ) {

        if (!canView(page)) {

            User user =
                    SecurityUtil.getCurrentUser();

            log.warn(
                    "Vendor view permission denied userId={} role={} page={}",
                    user.getId(),
                    user.getRole(),
                    page
            );

            throw new AccessDeniedException(
                    "You do not have permission to view this page."
            );
        }
    }

    @Override
    public void checkEdit(
            VendorPage page
    ) {

        if (!canEdit(page)) {

            User user =
                    SecurityUtil.getCurrentUser();

            log.warn(
                    "Vendor edit permission denied userId={} role={} page={}",
                    user.getId(),
                    user.getRole(),
                    page
            );

            throw new AccessDeniedException(
                    "You do not have permission to edit this page."
            );
        }
    }

    @Override
    public VendorPermissionsResponse getCurrentPermissions() {

        User user =
                SecurityUtil.getCurrentUser();

        if (user.getRole() == Role.VENDOR_ADMIN) {

            log.debug(
                    "Returning full vendor permissions userId={} role={}",
                    user.getId(),
                    user.getRole()
            );

            return VendorPermissionsResponse.builder()
                    .viewPages(
                            java.util.EnumSet.allOf(
                                    VendorPage.class
                            )
                    )
                    .editPages(
                            java.util.EnumSet.allOf(
                                    VendorPage.class
                            )
                    )
                    .build();
        }

        if (user.getRole() == Role.ADMIN) {

            log.debug(
                    "Returning full vendor permissions for support-mode admin userId={}",
                    user.getId()
            );

            return VendorPermissionsResponse.builder()
                    .viewPages(
                            java.util.EnumSet.allOf(
                                    VendorPage.class
                            )
                    )
                    .editPages(
                            java.util.EnumSet.allOf(
                                    VendorPage.class
                            )
                    )
                    .build();
        }

        if (user.getRole() == Role.VENDOR_USER) {

            if (user.getVendorId() == null ||
                    user.getVendorId().isBlank()) {

                log.warn(
                        "VendorUser has no vendor assignment while retrieving permissions userId={}",
                        user.getId()
                );

                return VendorPermissionsResponse.builder()
                        .viewPages(
                                java.util.EnumSet.noneOf(
                                        VendorPage.class
                                )
                        )
                        .editPages(
                                java.util.EnumSet.noneOf(
                                        VendorPage.class
                                )
                        )
                        .build();
            }

            VendorUserPermission permission =
                    permissionRepository
                            .findByUserIdAndVendorId(
                                    user.getId(),
                                    user.getVendorId()
                            )
                            .orElse(null);

            if (permission == null) {

                log.debug(
                        "No vendor permissions found userId={} vendorId={}",
                        user.getId(),
                        user.getVendorId()
                );

                return VendorPermissionsResponse.builder()
                        .viewPages(
                                java.util.EnumSet.noneOf(
                                        VendorPage.class
                                )
                        )
                        .editPages(
                                java.util.EnumSet.noneOf(
                                        VendorPage.class
                                )
                        )
                        .build();
            }

            java.util.Set<VendorPage> viewPages =
                    permission.getViewPages() == null
                            ? new java.util.HashSet<>()
                            : new java.util.HashSet<>(
                            permission.getViewPages()
                    );

            java.util.Set<VendorPage> editPages =
                    permission.getEditPages() == null
                            ? new java.util.HashSet<>()
                            : new java.util.HashSet<>(
                            permission.getEditPages()
                    );

            viewPages.addAll(editPages);

            log.debug(
                    "Vendor permissions retrieved userId={} vendorId={} viewCount={} editCount={}",
                    user.getId(),
                    user.getVendorId(),
                    viewPages.size(),
                    editPages.size()
            );

            return VendorPermissionsResponse.builder()
                    .viewPages(viewPages)
                    .editPages(editPages)
                    .build();
        }

        log.debug(
                "No vendor permissions for non-vendor role userId={} role={}",
                user.getId(),
                user.getRole()
        );

        return VendorPermissionsResponse.builder()
                .viewPages(
                        java.util.EnumSet.noneOf(
                                VendorPage.class
                        )
                )
                .editPages(
                        java.util.EnumSet.noneOf(
                                VendorPage.class
                        )
                )
                .build();
    }
}
