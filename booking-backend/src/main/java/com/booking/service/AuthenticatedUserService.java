package com.booking.service;

import com.booking.model.User;

public interface AuthenticatedUserService {

    User getCurrentUser();

    User getCurrentCustomer();

    User getCurrentVendor();

}