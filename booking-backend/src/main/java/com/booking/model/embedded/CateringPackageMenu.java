package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CateringPackageMenu {
    private Integer vegetarianSelectionLimit = 0;
    private Integer nonVegetarianSelectionLimit = 0;
    private Integer soupSelectionLimit = 0;
    private Integer dessertSelectionLimit = 0;

    private List<CateringPackageDish> vegetarianDishes = new ArrayList<>();
    private List<CateringPackageDish> nonVegetarianDishes = new ArrayList<>();
    private List<CateringPackageDish> soupDishes = new ArrayList<>();
    private List<CateringPackageDish> dessertDishes = new ArrayList<>();
}
