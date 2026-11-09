package com.booking.controller;

import com.booking.model.ServiceAttributeSuggestion;
import com.booking.model.enums.ServiceAttributeType;
import com.booking.model.enums.ServiceCategory;
import com.booking.repository.ServiceAttributeSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/service-attribute-directory")
@RequiredArgsConstructor
public class ServiceAttributeDirectoryController {
    private final ServiceAttributeSuggestionRepository repository;

    @GetMapping
    public List<ServiceAttributeSuggestion> suggestions(
            @RequestParam String category,
            @RequestParam ServiceAttributeType type) {
        String normalizedCategory = normalizeCategory(category);
        return repository
                .findByCategoryAndTypeAndActiveTrueAndApprovalStatusOrderByDisplayOrderAscNameAsc(
                        normalizedCategory, type, "APPROVED");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceAttributeSuggestion addCustom(
            @RequestBody ServiceAttributeSuggestion request) {
        if (request.getCategory() == null || request.getType() == null
                || request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Category, type and name are required.");
        }
        String category = normalizeCategory(request.getCategory());
        String name = request.getName().trim().replaceAll("\\s+", " ");
        if (name.length() > 80) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Suggestion name must be 80 characters or fewer.");
        }
        String normalized = normalize(name);
        return repository.findFirstByCategoryAndTypeAndNormalizedName(
                        category, request.getType(), normalized)
                .orElseGet(() -> {
                    ServiceAttributeSuggestion item = new ServiceAttributeSuggestion();
                    item.setCategory(category);
                    item.setType(request.getType());
                    item.setName(name);
                    item.setNormalizedName(normalized);
                    item.setActive(true);
                    item.setSystemDefined(false);
                    // Custom suggestions are saved for vendor use immediately,
                    // but do not become global suggestions until approved.
                    item.setApprovalStatus("PENDING");
                    return repository.save(item);
                });
    }

    private String normalizeCategory(String value) {
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        try {
            return ServiceCategory.valueOf(normalized).name();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported service category.");
        }
    }

    private String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " ");
    }
}
