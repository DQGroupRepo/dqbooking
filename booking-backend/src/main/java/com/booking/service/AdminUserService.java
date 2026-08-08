package com.booking.service;

import com.booking.dto.admin.AdminUserResponse;

import java.util.List;

public interface AdminUserService {

    List<AdminUserResponse> getUsers();

    AdminUserResponse getUser(String userId);
}