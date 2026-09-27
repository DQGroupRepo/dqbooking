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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
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

            log.info(
                    "Catering menu not found, returning empty menu vendorId={} serviceId={}",
                    vendorId,
                    serviceId
            );

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

        CateringMenuResponse response =
                toResponse(
                        menu
                );

        log.info(
                "Catering menu retrieved vendorId={} serviceId={} itemCount={}",
                vendorId,
                serviceId,
                response.getItems() == null
                        ? 0
                        : response.getItems().size()
        );

        return response;
    }

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

        log.info(
                "Updating catering menu vendorId={} serviceId={}",
                vendorId,
                serviceId
        );

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

                            log.debug(
                                    "Creating new catering menu vendorId={} serviceId={}",
                                    vendorId,
                                    serviceId
                            );

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

        log.info(
                "Catering menu updated vendorId={} serviceId={} menuId={} itemCount={}",
                vendorId,
                serviceId,
                savedMenu.getId(),
                savedMenu.getItems() == null
                        ? 0
                        : savedMenu.getItems().size()
        );

        return toResponse(
                savedMenu
        );
    }

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
                        .orElseThrow(() -> {
                            log.warn(
                                    "Catering service not found or not owned vendorId={} serviceId={}",
                                    vendorId,
                                    serviceId
                            );

                            return new ResourceNotFoundException(
                                    "Service not found."
                            );
                        });

        if (
                service.getCategory()
                        != ServiceCategory.CATERING
        ) {

            log.warn(
                    "Requested service is not a catering service vendorId={} serviceId={} category={}",
                    vendorId,
                    serviceId,
                    service.getCategory()
            );

            throw new ResourceNotFoundException(
                    "Catering service not found."
            );
        }

        return service;
    }

    private void validateRequest(
            CateringMenuRequest request
    ) {

        if (request == null) {

            log.warn("Catering menu update rejected because request is null");

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

            if (
                    itemRequest.getId() != null &&
                            !itemRequest.getId().isBlank()
            ) {

                if (
                        !itemIds.add(
                                itemRequest.getId()
                        )
                ) {

                    log.warn(
                            "Catering menu update rejected because of duplicate item ID"
                    );

                    throw new IllegalArgumentException(
                            "Duplicate catering menu item ID."
                    );
                }
            }
        }
    }

    private void validateMenuItem(
            CateringMenuItemRequest request
    ) {

        if (request == null) {

            log.warn("Catering menu item validation failed because item is null");

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

            log.warn("Catering menu item validation failed because price is invalid");

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

        if (
                !hasDishId &&
                        !hasCustomName
        ) {

            log.warn(
                    "Catering menu item validation failed because neither dish nor custom name was supplied"
            );

            throw new IllegalArgumentException(
                    "A catering menu item must reference a dish or provide a custom dish name."
            );
        }

        if (
                hasDishId &&
                        hasCustomName
        ) {

            log.warn(
                    "Catering menu item validation failed because both standard and custom dish values were supplied"
            );

            throw new IllegalArgumentException(
                    "A catering menu item cannot contain both a dish ID and a custom dish name."
            );
        }

        if (hasDishId) {

            CateringDish dish =
                    cateringDishRepository
                            .findById(
                                    request.getDishId()
                            )
                            .orElseThrow(() -> {
                                log.warn(
                                        "Catering dish not found dishId={}",
                                        request.getDishId()
                                );

                                return new ResourceNotFoundException(
                                        "Catering dish not found."
                                );
                            });

            if (
                    Boolean.FALSE.equals(
                            dish.getActive()
                    ) ||
                            Boolean.TRUE.equals(
                                    dish.getDeleted()
                            )
            ) {

                log.warn(
                        "Catering menu item rejected because selected dish is inactive dishId={}",
                        request.getDishId()
                );

                throw new IllegalArgumentException(
                        "The selected catering dish is inactive."
                );
            }

            return;
        }

        if (
                request.getCuisine() == null ||
                        request.getCuisine().isBlank()
        ) {

            log.warn(
                    "Custom catering dish rejected because cuisine is missing"
            );

            throw new IllegalArgumentException(
                    "Custom dish cuisine is required."
            );
        }

        if (
                request.getCategory() == null ||
                        request.getCategory().isBlank()
        ) {

            log.warn(
                    "Custom catering dish rejected because category is missing"
            );

            throw new IllegalArgumentException(
                    "Custom dish category is required."
            );
        }

        if (
                request.getFoodType() == null ||
                        request.getFoodType().isBlank()
        ) {

            log.warn(
                    "Custom catering dish rejected because food type is missing"
            );

            throw new IllegalArgumentException(
                    "Custom dish food type is required."
            );
        }
    }

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

    private VendorCateringMenuItem mapItem(
            CateringMenuItemRequest request
    ) {

        VendorCateringMenuItem item =
                new VendorCateringMenuItem();

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

        vendorPermissionService.checkView(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        log.info(
                "Retrieving catering menu options vendorId={} serviceId={}",
                vendorId,
                serviceId
        );

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

        if (
                service.getCategory() !=
                        ServiceCategory.CATERING
        ) {

            log.warn(
                    "Catering menu options requested for non-catering service vendorId={} serviceId={} category={}",
                    vendorId,
                    serviceId,
                    service.getCategory()
            );

            throw new IllegalArgumentException(
                    "Catering menu options are only available for catering services."
            );
        }

        List<CateringDish> masterDishes =
                cateringDishRepository
                        .findByCuisineAndActiveTrueAndDeletedFalse(
                                cuisine
                        );

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

        VendorCateringMenu vendorMenu =
                vendorCateringMenuRepository
                        .findByServiceIdAndVendorId(
                                serviceId,
                                vendorId
                        )
                        .orElse(null);

        Map<String, VendorCateringMenuItem> savedStandardItems =
                new HashMap<>();

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

                if (
                        item.getDishId() != null &&
                                !item.getDishId().isBlank()
                ) {

                    savedStandardItems.put(
                            item.getDishId(),
                            item
                    );

                } else if (
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

        List<CateringMenuOptionResponse> result =
                new ArrayList<>();

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

            } else {

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

            response.setSelected(
                    true
            );

            result.add(
                    response
            );
        }

        log.info(
                "Catering menu options retrieved vendorId={} serviceId={} optionCount={}",
                vendorId,
                serviceId,
                result.size()
        );

        return result;
    }
}
