package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringPackageMenuResponse {
    private Integer vegetarianSelectionLimit = 0;
    private Integer nonVegetarianSelectionLimit = 0;
    private Integer soupSelectionLimit = 0;
    private Integer dessertSelectionLimit = 0;

    private List<CateringPackageDishResponse> vegetarianDishes = new ArrayList<>();
    private List<CateringPackageDishResponse> nonVegetarianDishes = new ArrayList<>();
    private List<CateringPackageDishResponse> soupDishes = new ArrayList<>();
    private List<CateringPackageDishResponse> dessertDishes = new ArrayList<>();
}
