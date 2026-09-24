package com.booking.service.impl;

import com.booking.dto.service.*;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.CateringDish;
import com.booking.model.VendorCateringMenu;
import com.booking.model.VendorService;
import com.booking.model.embedded.VendorCateringMenuItem;
import com.booking.model.enums.ServiceCategory;
import com.booking.model.enums.VendorPage;
import com.booking.repository.CateringDishRepository;
import com.booking.repository.VendorCateringMenuRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorCateringMenuService;
import com.booking.service.VendorPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VendorCateringMenuServiceImpl
        implements VendorCateringMenuService {

    private final VendorCateringMenuRepository
            vendorCateringMenuRepository;

    private final VendorServiceRepository
            vendorServiceRepository;

    private final CateringDishRepository
            cateringDishRepository;

    private final VendorAccessService
            vendorAccessService;

    private final VendorPermissionService
            vendorPermissionService;


    /*
     * =========================================
     * GET MENU
     * =========================================
     */

    @Override
    @Transactional(readOnly = true)
    public CateringMenuResponse getMenu(
            String serviceId
    ) {

        vendorPermissionService.checkView(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        VendorService service =
                getOwnedCateringService(
                        serviceId,
                        vendorId
                );

        VendorCateringMenu menu =
                vendorCateringMenuRepository
                        .findByServiceIdAndVendorId(
                                service.getId(),
                                vendorId
                        )
                        .orElse(null);

        if (menu == null) {

            CateringMenuResponse response =
                    new CateringMenuResponse();

            response.setServiceId(
                    service.getId()
            );

            response.setVendorId(
                    vendorId
            );

            response.setItems(
                    new ArrayList<>()
            );

            return response;
        }

        return toResponse(
                menu
        );
    }


    /*
     * =========================================
     * UPDATE MENU
     * =========================================
     */

    @Override
    @Transactional
    public CateringMenuResponse updateMenu(
            String serviceId,
            CateringMenuRequest request
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        VendorService service =
                getOwnedCateringService(
                        serviceId,
                        vendorId
                );

        validateRequest(
                request
        );

        VendorCateringMenu menu =
                vendorCateringMenuRepository
                        .findByServiceIdAndVendorId(
                                service.getId(),
                                vendorId
                        )
                        .orElseGet(() -> {

                            VendorCateringMenu newMenu =
                                    new VendorCateringMenu();

                            newMenu.setServiceId(
                                    service.getId()
                            );

                            newMenu.setVendorId(
                                    vendorId
                            );

                            newMenu.setItems(
                                    new ArrayList<>()
                            );

                            return newMenu;
                        });

        menu.setServiceId(
                service.getId()
        );

        menu.setVendorId(
                vendorId
        );

        menu.setItems(
                mapItems(
                        request.getItems()
                )
        );

        VendorCateringMenu savedMenu =
                vendorCateringMenuRepository.save(
                        menu
                );

        return toResponse(
                savedMenu
        );
    }


    /*
     * =========================================
     * GET OWNED CATERING SERVICE
     * =========================================
     */

    private VendorService getOwnedCateringService(
            String serviceId,
            String vendorId
    ) {

        VendorService service =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service not found."
                                )
                        );

        if (
                service.getCategory()
                        != ServiceCategory.CATERING
        ) {

            throw new ResourceNotFoundException(
                    "Catering service not found."
            );
        }

        return service;
    }


    /*
     * =========================================
     * VALIDATE MENU REQUEST
     * =========================================
     */

    private void validateRequest(
            CateringMenuRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Catering menu request is required."
            );
        }

        if (request.getItems() == null) {
            return;
        }

        Set<String> itemIds =
                new HashSet<>();

        for (
                CateringMenuItemRequest itemRequest
                : request.getItems()
        ) {

            validateMenuItem(
                    itemRequest
            );

            /*
             * Existing vendor menu item IDs
             * must not occur twice.
             */
            if (
                    itemRequest.getId() != null &&
                            !itemRequest.getId().isBlank()
            ) {

                if (
                        !itemIds.add(
                                itemRequest.getId()
                        )
                ) {

                    throw new IllegalArgumentException(
                            "Duplicate catering menu item ID."
                    );
                }
            }
        }
    }


    /*
     * =========================================
     * VALIDATE MENU ITEM
     * =========================================
     */

    private void validateMenuItem(
            CateringMenuItemRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Catering menu item cannot be null."
            );
        }

        BigDecimal price =
                request.getPricePerPerson();

        if (
                price == null ||
                        price.compareTo(
                                BigDecimal.ZERO
                        ) < 0
        ) {

            throw new IllegalArgumentException(
                    "Catering menu item price must be zero or greater."
            );
        }

        boolean hasDishId =
                request.getDishId() != null &&
                        !request.getDishId().isBlank();

        boolean hasCustomName =
                request.getCustomName() != null &&
                        !request.getCustomName().isBlank();

        /*
         * A menu item must be either:
         *
         * 1. standard catalog dish
         * OR
         * 2. custom dish
         */
        if (
                !hasDishId &&
                        !hasCustomName
        ) {

            throw new IllegalArgumentException(
                    "A catering menu item must reference a dish or provide a custom dish name."
            );
        }

        /*
         * Do not allow an item to behave as
         * both a standard and custom dish.
         */
        if (
                hasDishId &&
                        hasCustomName
        ) {

            throw new IllegalArgumentException(
                    "A catering menu item cannot contain both a dish ID and a custom dish name."
            );
        }

        /*
         * =========================================
         * STANDARD MASTER DISH
         * =========================================
         */

        if (hasDishId) {

            CateringDish dish =
                    cateringDishRepository
                            .findById(
                                    request.getDishId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Catering dish not found."
                                    )
                            );

            if (
                    Boolean.FALSE.equals(
                            dish.getActive()
                    ) ||
                            Boolean.TRUE.equals(
                                    dish.getDeleted()
                            )
            ) {

                throw new IllegalArgumentException(
                        "The selected catering dish is inactive."
                );
            }

            /*
             * The authoritative values for a
             * standard dish come from the master
             * catalog, not from the client.
             *
             * Therefore the request's:
             *
             * cuisine
             * category
             * foodType
             *
             * are not trusted.
             */
            return;
        }

        /*
         * =========================================
         * CUSTOM DISH
         * =========================================
         */

        if (
                request.getCuisine() == null ||
                        request.getCuisine().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Custom dish cuisine is required."
            );
        }

        if (
                request.getCategory() == null ||
                        request.getCategory().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Custom dish category is required."
            );
        }

        if (
                request.getFoodType() == null ||
                        request.getFoodType().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Custom dish food type is required."
            );
        }
    }


    /*
     * =========================================
     * MAP REQUEST ITEMS
     * =========================================
     */

    private List<VendorCateringMenuItem> mapItems(
            List<CateringMenuItemRequest> requests
    ) {

        if (
                requests == null ||
                        requests.isEmpty()
        ) {

            return new ArrayList<>();
        }

        return requests
                .stream()
                .map(
                        this::mapItem
                )
                .toList();
    }


    /*
     * =========================================
     * MAP SINGLE ITEM
     * =========================================
     */

    private VendorCateringMenuItem mapItem(
            CateringMenuItemRequest request
    ) {

        VendorCateringMenuItem item =
                new VendorCateringMenuItem();

        /*
         * Preserve the frontend/vendor item ID
         * during an update.
         *
         * Generate one for new items.
         */
        if (
                request.getId() != null &&
                        !request.getId().isBlank()
        ) {

            item.setId(
                    request.getId()
            );

        } else {

            item.setId(
                    UUID.randomUUID()
                            .toString()
            );
        }

        item.setDishId(
                request.getDishId()
        );

        item.setCustomName(
                request.getCustomName()
        );

        item.setPricePerPerson(
                request.getPricePerPerson()
        );

        item.setActive(
                request.isActive()
        );

        /*
         * Standard dishes get their
         * catalog metadata from the master.
         */
        if (
                request.getDishId() != null &&
                        !request.getDishId().isBlank()
        ) {

            CateringDish dish =
                    cateringDishRepository
                            .findById(
                                    request.getDishId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Catering dish not found."
                                    )
                            );

            item.setCuisine(
                    dish.getCuisine()
            );

            item.setCategory(
                    dish.getCategory()
            );

            item.setFoodType(
                    dish.getFoodType()
            );

        } else {

            /*
             * Custom dish owns its own metadata.
             */
            item.setCuisine(
                    request.getCuisine()
            );

            item.setCategory(
                    request.getCategory()
            );

            item.setFoodType(
                    request.getFoodType()
            );
        }

        return item;
    }


    /*
     * =========================================
     * MAP RESPONSE
     * =========================================
     */

    private CateringMenuResponse toResponse(
            VendorCateringMenu menu
    ) {

        CateringMenuResponse response =
                new CateringMenuResponse();

        response.setServiceId(
                menu.getServiceId()
        );

        response.setVendorId(
                menu.getVendorId()
        );

        List<CateringMenuItemResponse> items =
                menu.getItems() == null

                        ? new ArrayList<>()

                        : menu.getItems()
                        .stream()
                        .map(
                                this::toItemResponse
                        )
                        .toList();

        response.setItems(
                items
        );

        return response;
    }


    /*
     * =========================================
     * MAP ITEM RESPONSE
     * =========================================
     */

    private CateringMenuItemResponse toItemResponse(
            VendorCateringMenuItem item
    ) {

        CateringMenuItemResponse response =
                new CateringMenuItemResponse();

        response.setId(
                item.getId()
        );

        response.setDishId(
                item.getDishId()
        );

        response.setPricePerPerson(
                item.getPricePerPerson()
        );

        response.setActive(
                item.isActive()
        );

        /*
         * Custom item.
         */
        if (
                item.getDishId() == null ||
                        item.getDishId().isBlank()
        ) {

            response.setName(
                    item.getCustomName()
            );

            response.setCuisine(
                    item.getCuisine()
            );

            response.setCategory(
                    item.getCategory()
            );

            response.setFoodType(
                    item.getFoodType()
            );

            response.setCustom(
                    true
            );

            return response;
        }

        /*
         * Standard catalog item.
         */
        CateringDish dish =
                cateringDishRepository
                        .findById(
                                item.getDishId()
                        )
                        .orElse(null);

        if (dish != null) {

            response.setName(
                    dish.getName()
            );

            response.setCuisine(
                    dish.getCuisine()
            );

            response.setCategory(
                    dish.getCategory()
            );

            response.setFoodType(
                    dish.getFoodType()
            );

        } else {

            /*
             * Keep the vendor menu item usable even
             * if the master record is no longer found.
             *
             * This is particularly useful when
             * inspecting an existing vendor menu.
             */
            response.setCuisine(
                    item.getCuisine()
            );

            response.setCategory(
                    item.getCategory()
            );

            response.setFoodType(
                    item.getFoodType()
            );
        }

        response.setCustom(
                false
        );

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CateringMenuOptionResponse> getMenuOptions(
            String serviceId,
            String cuisine,
            String foodType
    ) {

        /*
         * =========================================
         * VIEW PERMISSION
         * =========================================
         */

        vendorPermissionService.checkView(
                VendorPage.SERVICES
        );


        /*
         * =========================================
         * EFFECTIVE VENDOR
         * =========================================
         */

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();


        /*
         * =========================================
         * SERVICE OWNERSHIP
         * =========================================
         */

        VendorService service =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Service not found."
                                )
                        );


        /*
         * =========================================
         * CATEGORY CHECK
         * =========================================
         */

        if (
                service.getCategory() !=
                        ServiceCategory.CATERING
        ) {

            throw new IllegalArgumentException(
                    "Catering menu options are only available for catering services."
            );

        }


        /*
         * =========================================
         * MASTER DISHES
         * =========================================
         *
         * Get global dishes matching cuisine.
         */

        List<CateringDish> masterDishes =
                cateringDishRepository
                        .findByCuisineAndActiveTrueAndDeletedFalse(
                                cuisine
                        );


        /*
         * Apply food type filtering when
         * exactly one food type is requested.
         */

        if (
                foodType != null &&
                        !foodType.isBlank()
        ) {

            String normalizedFoodType =
                    foodType
                            .trim()
                            .replace("_", "-");

            masterDishes =
                    masterDishes.stream()
                            .filter(
                                    dish ->
                                            dish.getFoodType() != null &&
                                                    dish.getFoodType()
                                                            .trim()
                                                            .replace("_", "-")
                                                            .equalsIgnoreCase(
                                                                    normalizedFoodType
                                                            )
                            )
                            .toList();

        }


        /*
         * =========================================
         * EXISTING VENDOR MENU
         * =========================================
         */

        VendorCateringMenu vendorMenu =
                vendorCateringMenuRepository
                        .findByServiceIdAndVendorId(
                                serviceId,
                                vendorId
                        )
                        .orElse(null);


        /*
         * =========================================
         * SAVED STANDARD ITEMS
         * =========================================
         */

        Map<String, VendorCateringMenuItem> savedStandardItems =
                new HashMap<>();


        /*
         * =========================================
         * SAVED CUSTOM ITEMS
         * =========================================
         */

        List<VendorCateringMenuItem> customItems =
                new ArrayList<>();


        if (
                vendorMenu != null &&
                        vendorMenu.getItems() != null
        ) {

            for (
                    VendorCateringMenuItem item :
                    vendorMenu.getItems()
            ) {

                /*
                 * Standard master dish
                 */
                if (
                        item.getDishId() != null &&
                                !item.getDishId().isBlank()
                ) {

                    savedStandardItems.put(
                            item.getDishId(),
                            item
                    );

                }

                /*
                 * Vendor custom dish
                 */
                else if (
                        item.getCustomName() != null &&
                                !item.getCustomName().isBlank()
                ) {

                    boolean cuisineMatches =
                            cuisine == null ||
                                    cuisine.isBlank() ||
                                    (
                                            item.getCuisine() != null &&
                                                    item.getCuisine()
                                                            .equalsIgnoreCase(
                                                                    cuisine
                                                            )
                                    );


                    boolean foodTypeMatches =
                            foodType == null ||
                                    foodType.isBlank() ||
                                    (
                                            item.getFoodType() != null &&
                                                    item.getFoodType()
                                                            .trim()
                                                            .replace("_", "-")
                                                            .equalsIgnoreCase(
                                                                    foodType
                                                                            .trim()
                                                                            .replace("_", "-")
                                                            )
                                    );


                    if (
                            cuisineMatches &&
                                    foodTypeMatches &&
                                    item.isActive()
                    ) {

                        customItems.add(
                                item
                        );

                    }

                }

            }

        }


        /*
         * =========================================
         * BUILD RESPONSE
         * =========================================
         */

        List<CateringMenuOptionResponse> result =
                new ArrayList<>();


        /*
         * =========================================
         * ADD MASTER DISHES
         * =========================================
         */

        for (
                CateringDish dish :
                masterDishes
        ) {

            CateringMenuOptionResponse response =
                    new CateringMenuOptionResponse();


            response.setId(
                    dish.getId()
            );

            response.setDishId(
                    dish.getId()
            );

            response.setName(
                    dish.getName()
            );

            response.setCuisine(
                    dish.getCuisine()
            );

            response.setCategory(
                    dish.getCategory()
            );

            response.setFoodType(
                    dish.getFoodType()
            );

            response.setActive(
                    dish.getActive()
            );

            response.setCustom(
                    false
            );


            VendorCateringMenuItem savedItem =
                    savedStandardItems.get(
                            dish.getId()
                    );


            if (
                    savedItem != null
            ) {

                response.setSelected(
                        savedItem.isActive()
                );

                response.setPricePerPerson(
                        savedItem.getPricePerPerson()
                );

            }
            else {

                response.setSelected(
                        false
                );

                response.setPricePerPerson(
                        null
                );

            }


            result.add(
                    response
            );

        }


        /*
         * =========================================
         * ADD VENDOR CUSTOM DISHES
         * =========================================
         */

        for (
                VendorCateringMenuItem item :
                customItems
        ) {

            CateringMenuOptionResponse response =
                    new CateringMenuOptionResponse();


            response.setId(
                    item.getId()
            );

            response.setDishId(
                    null
            );

            response.setName(
                    item.getCustomName()
            );

            response.setCuisine(
                    item.getCuisine()
            );

            response.setCategory(
                    item.getCategory()
            );

            response.setFoodType(
                    item.getFoodType()
            );

            response.setPricePerPerson(
                    item.getPricePerPerson()
            );

            response.setActive(
                    item.isActive()
            );

            response.setCustom(
                    true
            );

            /*
             * A custom item returned from
             * vendor_catering_menus is already
             * part of the vendor's menu.
             */
            response.setSelected(
                    true
            );


            result.add(
                    response
            );

        }


        return result;
    }

}