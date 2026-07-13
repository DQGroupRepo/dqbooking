package com.booking.service;

import com.booking.model.User;
import com.booking.model.Vendor;

public interface AuthenticatedUserService {

    User getCurrentUser();

    User getCurrentCustomer();

    Vendor getCurrentVendor();

}