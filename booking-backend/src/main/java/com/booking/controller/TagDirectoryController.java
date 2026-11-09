package com.booking.controller;

import com.booking.model.CategoryTagSuggestion;
import com.booking.model.LocationDirectoryEntry;
import com.booking.repository.CategoryTagSuggestionRepository;
import com.booking.repository.LocationDirectoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/tag-directory")
@RequiredArgsConstructor
public class TagDirectoryController {

 private final CategoryTagSuggestionRepository categories;
 private final LocationDirectoryRepository locations;

 /**
  * Returns autocomplete suggestions from the category master directory only.
  * These suggestions do not determine customer results; selecting one sends
  * its exact name to the existing service-tag search endpoint.
  */
 @GetMapping("/category-suggestions")
 public List<CategoryTagSuggestion> categorySuggestions(@RequestParam("q") String query) {
  String normalizedQuery = normalize(query == null ? "" : query);
  if (normalizedQuery.isBlank()) {
   return List.of();
  }

  return categories.findAll().stream()
          .filter(CategoryTagSuggestion::isActive)
          .filter(item -> item.getName() != null && !item.getName().isBlank())
          .filter(item -> {
           String source = item.getNormalizedName() == null || item.getNormalizedName().isBlank()
                   ? item.getName() : item.getNormalizedName();
           return normalize(source).contains(normalizedQuery);
          })
          .sorted((left, right) -> {
           String leftName = normalize(left.getNormalizedName() == null ? left.getName() : left.getNormalizedName());
           String rightName = normalize(right.getNormalizedName() == null ? right.getName() : right.getNormalizedName());
           int leftRank = leftName.equals(normalizedQuery) ? 0 : leftName.startsWith(normalizedQuery) ? 1 : 2;
           int rightRank = rightName.equals(normalizedQuery) ? 0 : rightName.startsWith(normalizedQuery) ? 1 : 2;
           int rankComparison = Integer.compare(leftRank, rightRank);
           return rankComparison != 0 ? rankComparison : left.getName().compareToIgnoreCase(right.getName());
          })
          .limit(8)
          .toList();
 }

 @GetMapping("/categories")
 public List<CategoryTagSuggestion> categories(@RequestParam String parentCategory) {
  return categories.findByParentCategoryAndActiveTrueOrderByNameAsc(
          parentCategory.trim().toUpperCase(Locale.ROOT)
  );
 }

 /** Returns all active districts for the requested state, without truncating the directory. */
 @GetMapping("/locations/districts")
 public List<String> districts(@RequestParam(defaultValue = "Kerala") String state) {
  return locations.findByStateIgnoreCaseAndActiveTrueOrderByDistrictAscNameAsc(state)
          .stream()
          .map(LocationDirectoryEntry::getDistrict)
          .filter(district -> district != null && !district.isBlank())
          .map(String::trim)
          .distinct()
          .sorted(String.CASE_INSENSITIVE_ORDER)
          .toList();
 }

 @GetMapping("/locations")
 public List<LocationDirectoryEntry> locations(
         @RequestParam(defaultValue = "Kerala") String state,
         @RequestParam(required = false) String district
 ) {
  if (district == null || district.isBlank()) {
   return locations.findByStateIgnoreCaseAndActiveTrueOrderByDistrictAscNameAsc(state);
  }
  return locations.findByStateIgnoreCaseAndDistrictIgnoreCaseAndActiveTrueOrderByNameAsc(state, district.trim());
 }

 @PostMapping("/categories")
 public CategoryTagSuggestion addCategory(@RequestBody CategoryTagSuggestion item) {
  item.setId(null);
  item.setSystemDefined(false);
  item.setActive(true);
  item.setParentCategory(item.getParentCategory().trim().toUpperCase(Locale.ROOT));
  item.setName(item.getName().trim());
  item.setNormalizedName(normalize(item.getName()));
  var existing = categories.findByParentCategoryIgnoreCaseAndNameIgnoreCase(
          item.getParentCategory(), item.getName()
  );
  return existing.isEmpty() ? categories.save(item) : existing.get(0);
 }

 @PostMapping("/locations")
 public LocationDirectoryEntry addLocation(@RequestBody LocationDirectoryEntry item) {
  item.setId(null);
  item.setSystemDefined(false);
  item.setActive(true);
  item.setState(item.getState() == null ? "Kerala" : item.getState().trim());
  item.setDistrict(item.getDistrict() == null ? "" : item.getDistrict().trim());
  item.setName(item.getName().trim());
  item.setNormalizedName(normalize(item.getName()));
  var existing = locations.findFirstByStateIgnoreCaseAndDistrictIgnoreCaseAndNormalizedName(
          item.getState(), item.getDistrict(), item.getNormalizedName()
  );
  return existing == null ? locations.save(item) : existing;
 }

 private String normalize(String value) {
  return Normalizer.normalize(value, Normalizer.Form.NFD)
          .replaceAll("\\p{M}", "")
          .toLowerCase(Locale.ROOT)
          .trim()
          .replaceAll("\\s+", " ");
 }
}
