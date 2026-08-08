package com.booking.controller;

import com.booking.dto.admin.AdminUserResponse;
import com.booking.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponse> getUsers() {

        return adminUserService.getUsers();
    }

    @GetMapping("/{userId}")
    public AdminUserResponse getUser(
            @PathVariable String userId
    ) {

        return adminUserService.getUser(userId);
    }
}