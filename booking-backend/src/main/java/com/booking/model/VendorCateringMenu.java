package com.booking.model;

import com.booking.model.embedded.VendorCateringMenuItem;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "vendor_catering_menus")
public class VendorCateringMenu extends BaseEntity {

    @Indexed(unique = true)
    private String serviceId;

    private String vendorId;

    private List<VendorCateringMenuItem> items = new ArrayList<>();

}