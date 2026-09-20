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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorPermissionServiceImpl
        implements VendorPermissionService {

    private final VendorUserPermissionRepository
            permissionRepository;

    @Override
    public boolean canView(VendorPage page) {

        User user =
                SecurityUtil.getCurrentUser();

        /*
         * =========================================
         * VENDOR ADMIN
         * =========================================
         *
         * VendorAdmin has complete access to all
         * vendor pages.
         */
        if (user.getRole() == Role.VENDOR_ADMIN) {
            return true;
        }

        /*
         * =========================================
         * PLATFORM ADMIN
         * =========================================
         *
         * Admin in Vendor Support Mode has the
         * same vendor-level access as VendorAdmin.
         *
         * VendorAccessService is responsible for
         * verifying that Support Mode is active.
         */
        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        /*
         * =========================================
         * VENDOR USER
         * =========================================
         */

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

        /*
         * Edit permission automatically grants
         * View permission.
         */
        if (permission.getEditPages() != null &&
                permission.getEditPages().contains(page)) {

            return true;
        }

        /*
         * Explicit View permission.
         */
        return permission.getViewPages() != null &&
                permission.getViewPages().contains(page);
    }

    @Override
    public boolean canEdit(VendorPage page) {

        User user =
                SecurityUtil.getCurrentUser();

        /*
         * =========================================
         * VENDOR ADMIN
         * =========================================
         */

        if (user.getRole() == Role.VENDOR_ADMIN) {
            return true;
        }

        /*
         * =========================================
         * PLATFORM ADMIN
         * =========================================
         *
         * Admin Support Mode has full vendor access.
         */
        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        /*
         * =========================================
         * VENDOR USER
         * =========================================
         */

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

            throw new AccessDeniedException(
                    "You do not have permission to edit this page."
            );
        }
    }

    @Override
    public VendorPermissionsResponse getCurrentPermissions() {

        User user =
                SecurityUtil.getCurrentUser();

        /*
         * =========================================
         * VENDOR ADMIN
         * =========================================
         *
         * VendorAdmin has full access to every
         * vendor page.
         */
        if (user.getRole() == Role.VENDOR_ADMIN) {

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

        /*
         * =========================================
         * PLATFORM ADMIN
         * =========================================
         *
         * Support Mode has full vendor access.
         */
        if (user.getRole() == Role.ADMIN) {

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

        /*
         * =========================================
         * VENDOR USER
         * =========================================
         */

        if (user.getRole() == Role.VENDOR_USER) {

            if (user.getVendorId() == null ||
                    user.getVendorId().isBlank()) {

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

            /*
             * Edit automatically implies View.
             */
            viewPages.addAll(editPages);

            return VendorPermissionsResponse.builder()
                    .viewPages(viewPages)
                    .editPages(editPages)
                    .build();
        }

        /*
         * CUSTOMER or any other role
         * has no vendor permissions.
         */
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
