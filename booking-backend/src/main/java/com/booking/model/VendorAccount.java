package com.booking.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vendor_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorAccount {

    @Id
    private String id;

    /**
     * User ID of the VendorAdmin who owns this vendor account.
     *
     * This is the canonical vendor identity used
     * throughout vendor-owned data.
     */
    private String vendorAdminId;

    /**
     * Vendor's business name.
     */
    private String businessName;

    /**
     * Subscription plan assigned by Platform Admin.
     */
    private VendorPlan plan;

    /**
     * Maximum number of VendorUsers allowed.
     *
     * VendorAdmin is NOT counted here.
     */
    private Integer maxVendorUsers;

    /**
     * Whether the vendor account is active.
     */
    @Builder.Default
    private boolean active = true;
}