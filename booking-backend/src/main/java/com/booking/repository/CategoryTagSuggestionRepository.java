package com.booking.repository;
import com.booking.model.CategoryTagSuggestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface CategoryTagSuggestionRepository extends MongoRepository<CategoryTagSuggestion,String> { List<CategoryTagSuggestion> findByParentCategoryAndActiveTrueOrderByNameAsc(String parentCategory); List<CategoryTagSuggestion> findByParentCategoryIgnoreCaseAndNameIgnoreCase(String parentCategory, String name); }
