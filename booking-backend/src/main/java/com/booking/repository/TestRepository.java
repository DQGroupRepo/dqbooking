package com.booking.repository;

import com.booking.model.TestDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestRepository extends MongoRepository<TestDocument, String> {

}