package com.booking.controller;

import com.booking.model.ServiceAttributeSuggestion;
import com.booking.repository.ServiceAttributeSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/service-attribute-directory")
@RequiredArgsConstructor
public class AdminServiceAttributeDirectoryController {
    private final ServiceAttributeSuggestionRepository repository;

    @GetMapping("/pending")
    public List<ServiceAttributeSuggestion> pending() {
        return repository.findByApprovalStatusOrderByCategoryAscTypeAscNameAsc("PENDING");
    }

    @PatchMapping("/{id}/approve")
    public ServiceAttributeSuggestion approve(@PathVariable String id) {
        ServiceAttributeSuggestion item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        item.setApprovalStatus("APPROVED");
        item.setActive(true);
        return repository.save(item);
    }

    @PatchMapping("/{id}/reject")
    public ServiceAttributeSuggestion reject(@PathVariable String id) {
        ServiceAttributeSuggestion item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        item.setApprovalStatus("REJECTED");
        item.setActive(false);
        return repository.save(item);
    }
}
