package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "catering_dishes")
public class CateringDish extends BaseEntity {

    private String name;

    private String cuisine;

    private String category;

    private String foodType;

}