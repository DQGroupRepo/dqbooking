package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringPackageMenuRequest {
    private Integer vegetarianSelectionLimit = 0;
    private Integer nonVegetarianSelectionLimit = 0;
    private Integer soupSelectionLimit = 0;
    private Integer dessertSelectionLimit = 0;

    private List<CateringPackageDishRequest> vegetarianDishes = new ArrayList<>();
    private List<CateringPackageDishRequest> nonVegetarianDishes = new ArrayList<>();
    private List<CateringPackageDishRequest> soupDishes = new ArrayList<>();
    private List<CateringPackageDishRequest> dessertDishes = new ArrayList<>();
}
