package com.booking.model;

import com.booking.model.enums.VendorPage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vendor_user_permissions")
public class VendorUserPermission {

    @Id
    private String id;

    /**
     * VendorUser's User ID.
     */
    private String userId;

    /**
     *  Canonical vendor ID.
     *
     * This is the VendorAdmin User._id.
     */
    private String vendorId;

    /**
     * Pages the user can view.
     */
    @Builder.Default
    private Set<VendorPage> viewPages =
            new HashSet<>();

    /**
     * Pages the user can edit.
     *
     * Backend will ensure every edit page
     * is also a view page.
     */
    @Builder.Default
    private Set<VendorPage> editPages =
            new HashSet<>();
}