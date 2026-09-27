# EventNest — Comprehensive Project Context & Maintenance Guide

> **Purpose:** Long-term architecture, design, implementation, security, UI, data-model, and future-feature context for EventNest.
>
> **Last updated:** 2026-09-20
>
> **Status:** Active development
>
> **Important:** Items marked Pending/Future/To Verify are not necessarily implemented.

---

# 1. Product Overview

EventNest is an event-services marketplace/platform connecting customers with vendors providing event-related services.

Core areas:

- Customer discovery and booking
- Vendor service/listing management
- Vendor packages and pricing
- Vendor team management
- VendorUser page-level permissions
- Reviews
- Revenue
- Booking management
- Platform administration
- Vendor verification/moderation
- Vendor subscription/plan limits
- ADMIN Support Mode

Technology:

- Frontend: React 19, TypeScript, Vite, React Router, Axios, react-hot-toast, reusable CSS/UI components
- Backend: Spring Boot, Spring Security, JWT, MongoDB, Lombok, Jakarta validation
- Authentication: stateless JWT

---

# 2. High-Level Architecture

```text
Customers / Vendors / Admin
          |
          v
+-------------------------------+
| EventNest React Frontend      |
|                               |
| Customer | Vendor | Admin UI  |
+---------------+---------------+
                |
                | REST + JWT
                v
+-------------------------------+
| Spring Boot Backend           |
|                               |
| Security/JWT                  |
| Controllers                   |
| Services                      |
| Authorization                 |
| Pricing / Booking             |
| Vendor / Team / Reviews       |
+---------------+---------------+
                |
                v
             MongoDB
```

Main principle:

> Frontend controls presentation/UX; backend is authoritative for security, ownership, pricing, validation, and booking totals.

---

# 3. Roles and User Model

EventNest uses **one User collection**.

Roles:

```text
CUSTOMER
ADMIN
VENDOR_ADMIN
VENDOR_USER
```

## 3.1 VendorAdmin

A VendorAdmin is the canonical identity of a vendor.

```text
User.id       = canonical vendorId
User.role     = VENDOR_ADMIN
User.vendorId = null
```

VendorAdmin has implicit full vendor access. No stored permission document is required.

## 3.2 VendorUser

```text
User.id       = VendorUser ID
User.role     = VENDOR_USER
User.vendorId = VendorAdmin User._id
```

VendorUsers have page-level view/edit permissions.

Edit implies view.

## 3.3 ADMIN

ADMIN is platform-level.

ADMIN does not permanently belong to a vendor.

When ADMIN uses Support Mode:

```text
VendorSupportSession.vendorId
    =
VendorAdmin User._id
```

ADMIN does not impersonate/change role.

---

# 4. Canonical Vendor Identity

This is a critical architecture decision.

**VendorAdmin User._id is the canonical vendor ID.**

Vendor-owned records should use it:

```text
VendorService.vendorId
Booking.vendorId
VendorSupportSession.vendorId
VendorUser.vendorId
VendorUserPermission.vendorId
VendorCateringMenu.vendorId
```

Do not use VendorAccount._id as the canonical vendor identity.

---

# 5. VendorAccount

VendorAccount remains separate:

```java
@Document(collection = "vendor_accounts")
public class VendorAccount {

    @Id
    private String id;

    private String vendorAdminId;
    private String businessName;
    private VendorPlan plan;
    private Integer maxVendorUsers;
    private boolean active;
}
```

Relationship:

```text
VendorAccount.vendorAdminId
    ->
VendorAdmin User._id
```

Repository:

```java
Optional<VendorAccount> findByVendorAdminId(String vendorAdminId);
```

---

# 6. Vendor User Limits

Maximum VendorUsers comes from VendorAccount.maxVendorUsers.

Current user count should use:

```text
User.vendorId == VendorAdmin User._id
AND
User.role == VENDOR_USER
```

Do not count users using VendorAccount._id.

---

# 7. Vendor Registration

```text
Vendor registration
       |
       v
Create VendorAdmin User
       |
       +-- role = VENDOR_ADMIN
       +-- vendorId = null
       |
       v
Create VendorAccount
       |
       +-- vendorAdminId = VendorAdmin User._id
       |
       v
Return vendorId = VendorAdmin User._id
```

---

# 8. VendorPage Permissions

Current enum:

```java
public enum VendorPage {
    DASHBOARD,
    SERVICES,
    BOOKINGS,
    REVIEWS,
    REVENUE,
    BUNDLES,
    PROFILE,
    SETTINGS
}
```

Rules:

- VendorAdmin: full access
- ADMIN in Support Mode: full vendor access
- VendorUser: configured view/edit pages
- Edit permission implies view permission

Backend must enforce permissions. Frontend visibility is only UX.

---

# 9. VendorAccessService

Effective vendor ID:

```text
VENDOR_ADMIN
    -> current User.id

VENDOR_USER
    -> current User.vendorId

ADMIN
    -> active SupportSession.vendorId
```

ADMIN vendor operations require active Support Mode.

---

# 10. Support Mode

Flow:

```text
ADMIN
  |
  v
Select vendor
  |
  v
Start support session
  |
  v
VendorSupportSession.vendorId
  |
  v
VendorAccessService.getEffectiveVendorId()
  |
  v
Vendor services
```

ADMIN can manage Vendor team only while Support Mode is active.

VendorSidebar shows Team to:

```text
VENDOR_ADMIN
ADMIN + active Support Mode
```

---

# 11. Vendor Team

Endpoints:

```text
POST   /api/vendor/team
GET    /api/vendor/team
GET    /api/vendor/team/{userId}
PUT    /api/vendor/team/{userId}
PATCH  /api/vendor/team/{userId}/status
DELETE /api/vendor/team/{userId}
PUT    /api/vendor/team/{userId}/permissions
```

VendorTeam permission data:

```text
userId
vendorId
viewPages
editPages
```

Lookup should use:

```text
findByUserIdAndVendorId(...)
```

---

# 12. Authentication and HTTP Semantics

Important distinction:

## 401

Authentication failure:

- missing JWT
- invalid JWT
- expired JWT
- unauthenticated SecurityContext

Frontend may clear authentication.

## 403

Authenticated but not authorized:

- VendorUser lacks required page permission
- wrong role
- ADMIN without Support Mode
- ownership/permission failure

Frontend should show a friendly message and remain on the current page.

## 400

Invalid/business request:

- no applicable pricing
- invalid package configuration
- invalid request data

## 404

Resource not found.

---

# 13. Axios JWT

Shared Axios instance:

```text
src/api/axiosConfig.ts
```

Base URL:

```text
VITE_API_BASE_URL
```

JWT key:

```text
localStorage["eventnest_token"]
```

Request interceptor:

```ts
const token = localStorage.getItem("eventnest_token");

if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
```

Response interceptor currently treats 401 as authentication expiration.

403 must not trigger logout.

---

# 14. Important Authentication Bug Discovered

A pricing request contained a Bearer token but the backend threw:

```text
IllegalStateException:
No applicable pricing found for service.
```

That business exception was being returned as 401.

Frontend interpreted 401 as expired authentication and cleared:

```text
eventnest_token
```

This caused the next booking request to have no Bearer token and produce a genuine 401.

Correct flow should be:

```text
Pricing request
 -> business failure
 -> 400
 -> token remains

NOT:

Pricing request
 -> business failure
 -> 401
 -> logout
 -> token cleared
```

GlobalExceptionHandler must map business exceptions correctly.

Suggested handler:

```java
@ExceptionHandler(IllegalStateException.class)
public ResponseEntity<ErrorResponse> handleIllegalStateException(
        IllegalStateException ex
) {
    ErrorResponse error =
            new ErrorResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    ex.getMessage(),
                    LocalDateTime.now()
            );

    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(error);
}
```

Verify this against the current implementation before applying.

---

# 15. JWT Architecture

JWT contains:

```text
subject = userId
role claim
issuedAt
expiration
```

JWT filter:

```text
Authorization header
      |
      v
Bearer token
      |
      v
JwtService.isTokenValid()
      |
      v
extractUserId()
      |
      v
UserRepository.findById()
      |
      v
UsernamePasswordAuthenticationToken
      |
      v
SecurityContextHolder
```

Authority:

```text
ROLE_<USER_ROLE>
```

Examples:

```text
ROLE_CUSTOMER
ROLE_VENDOR_ADMIN
ROLE_VENDOR_USER
ROLE_ADMIN
```

---

# 16. SecurityConfig

Important rules:

```text
POST /api/bookings
    -> CUSTOMER only

GET /api/bookings/customer
    -> CUSTOMER

Vendor APIs
    -> VENDOR_ADMIN / VENDOR_USER / ADMIN

Booking details
    -> CUSTOMER / VENDOR_ADMIN / VENDOR_USER / ADMIN

/api/pricing/**
    -> public
```

Customer booking creation must remain customer-only.

Do not weaken this to fix unrelated authentication errors.

---

# 17. Booking Authorization

Booking service uses role-aware authorization.

Customer:

```text
booking.customerId == current customer
```

VendorAdmin/VendorUser:

```text
BOOKINGS VIEW
AND
booking.vendorId == effectiveVendorId
```

ADMIN:

```text
Support Mode active
AND
booking.vendorId == effectiveVendorId
```

Booking group access must validate all bookings in the group.

---

# 18. Booking Creation

Normal customer booking creation:

```text
BookingCheckout
   |
   v
POST /api/bookings
   |
   v
authenticated customer
   |
   v
booking creation
```

Vendors/Admins manage bookings but do not create customer bookings through the normal customer endpoint.

---

# 19. Vendor Service Ownership

Vendor services use:

```text
VendorAdmin User._id
```

Create:

```text
VendorAccessService.getEffectiveVendorId()
    ->
VendorAdmin lookup
    ->
VendorService.vendorId
```

Reads/updates/deletes should verify:

```text
serviceId + vendorId
```

to prevent cross-vendor access.

---

# 20. VendorOfferingService

Responsibilities include:

- create service
- update service
- delete service
- get service
- get vendor services
- change status
- get bundle services
- package validation
- update packages

Permission:

```text
SERVICES VIEW
SERVICES EDIT
```

New services:

```text
active = false
moderationStatus = PENDING
```

Status changes can also trigger moderation.

---

# 21. Add Service Screen

Existing workflow:

```text
1. Basic Information
2. Service Details
3. Category Specific Details
4. Service Images & Videos
5. Contact Information
6. Review & Publish
```

Right sidebar:

- Listing Progress
- Quick Navigation
- Helpful Tip

Quick navigation IDs:

```text
basic-information
service-details
category-details
service-media
contact-information
review-publish
```

The existing design should be preserved.

---

# 22. VendorAddService State

Current important state:

```ts
formData: VendorServiceForm
media: MediaItem[]
publishing: boolean
saved: boolean
errors: string[]
```

Edit mode:

```text
/vendor/services/{id}
```

Successful save navigates to:

```text
/vendor/services/{serviceId}/pricing
```

Media:

- existing URLs are preserved
- new media uploaded first
- ordering is preserved

403 handling is already intentionally separate from generic errors.

---

# 23. VendorServiceForm

Current common fields:

```ts
category
serviceName
location
address
capacity
description
durationHours

contactPerson
mobile
email

availableFrom
availableTo

maxSimultaneousBookings
bundleOfferEnabled

amenities
imageUrls
detailSections
```

Future catering addition should be structured:

```ts
cateringDetails?: CateringDetailsForm;
```

rather than forcing complex catering data into generic detailSections.

---

# 24. Generic Category Details

Current generic mechanism:

```text
CategorySpecificSection
    ->
CategoryDetailSections
    ->
ServiceDetailSection[]
```

Good for:

- Hall attributes
- Photography attributes
- other simple category-specific fields

Not ideal for complex catering menu data.

---

# 25. Category UI Architecture

Keep one top-level section:

```text
3. Category Specific Details
```

Do NOT create a separate top-level Catering tab.

Conceptually:

```text
CategorySpecificSection
    |
    +-- HallDetails
    +-- PhotographyDetails
    +-- CateringDetails
    +-- DecorationDetails
    +-- MakeupDetails
```

Catering is another category-specific component.

---

# 26. Catering Product Design

Agreed initial scope:

```text
Food Type
    + Vegetarian
    + Non-Vegetarian

Cuisine
    + Indian
    + Arabian
    + Chinese
    + extensible

Menu Categories
    + Main Course
    + Soup
    + Salad
    + Dessert

Menu Items
    + selectable
    + vendor price per person
    + active/inactive
    + custom dish support

Service
    + catering staff available
    + staff cost per person
    + maximum service distance
```

---

# 27. Catering UI Design

The design should fit the existing EventNest visual style:

- white cards
- rounded corners
- subtle borders
- blue accents
- clean headings
- aligned form controls
- compact helper text
- consistent spacing
- no unnecessary tabs

Catering screen:

```text
Category Specific Details
        |
        v
Catering Details
        |
        +-- Food Type
        +-- Cuisine
        +-- Menu Items by Cuisine
        +-- Service & Delivery
```

---

# 28. Catering Menu Scrolling

Explicit design decision:

**Each menu/cuisine card gets its own vertical scrollbar.**

Do not make the entire page/card scroll.

Structure:

```text
Cuisine Card
  |
  +-- Header                  fixed
  +-- Column headings         fixed
  +-- Dish list               scrollable
  +-- Add Custom Dish         fixed
```

Suggested dish-list height:

```text
260–300px
```

Exact CSS can be adjusted to existing design.

This prevents 100–200 dishes from distorting the page.

---

# 29. Catering Menu Item UI

Example:

```text
☑ Paneer Butter Masala       ₹180
☐ Dal Makhani                ₹150
☑ Veg Biryani                ₹120
```

Price means:

```text
price per person
```

Vendor can choose which dishes are offered.

---

# 30. Catering Custom Dishes

Vendor can click:

```text
+ Add Custom Dish
```

Custom dish data can include:

```text
name
food type
cuisine
menu category
price per person
active
```

A custom dish does not need to exist in the global master catalog.

---

# 31. Catering Service Staff

Vendor can choose:

```text
Providing Catering Staff?
    Yes / No
```

If Yes:

```text
Cost per person
```

Staff cost is separate from dish prices.

---

# 32. Catering Service Distance

Vendor enters:

```text
Maximum service distance
```

Prefer:

```text
Integer kilometers
```

Example:

```text
100 km
```

Future customer-side distance filtering/eligibility can use this value.

---

# 33. Catering MongoDB Strategy

Important concern:

> Multiple caterers may each have 100–200 dishes.

Do not duplicate full dish definitions into every VendorService.

Recommended architecture:

```text
CateringDish master collection
        |
        | dishId
        v
VendorCateringMenu
        |
        +-- vendor/service selection
        +-- price per person
        +-- active
```

This avoids unnecessary duplication.

---

# 34. CateringDish Master Collection

Proposed:

```text
catering_dishes
```

Example:

```json
{
  "_id": "...",
  "name": "Paneer Butter Masala",
  "cuisine": "INDIAN",
  "category": "MAIN_COURSE",
  "foodType": "VEGETARIAN",
  "active": true
}
```

A standard dish is stored once.

---

# 35. VendorCateringMenu

Proposed separate collection:

```text
vendor_catering_menus
```

Example:

```json
{
  "_id": "...",
  "serviceId": "...",
  "vendorId": "...",
  "items": [
    {
      "dishId": "...",
      "pricePerPerson": 180,
      "active": true
    }
  ]
}
```

This keeps VendorService smaller and allows independent menu management.

---

# 36. Custom Menu Item

Conceptual:

```json
{
  "dishId": null,
  "customName": "Kerala Style Fish Moilee",
  "cuisine": "INDIAN",
  "category": "MAIN_COURSE",
  "foodType": "NON_VEGETARIAN",
  "pricePerPerson": 280,
  "active": true
}
```

---

# 37. CateringDetails

Small service-level settings can be embedded:

```java
public class CateringDetails {

    private boolean vegetarian;
    private boolean nonVegetarian;
    private List<String> cuisines;
    private boolean providesCateringStaff;
    private BigDecimal staffCostPerPerson;
    private Integer maximumServiceDistanceKm;
}
```

These are small and appropriate to embed.

---

# 38. Why Not Put Catering Into detailSections

Catering has structured operational data:

```text
dish
cuisine
food type
category
price
package relationship
customer selection
staff pricing
distance
```

Generic key/value detailSections would make:

- querying harder
- validation harder
- price calculation harder
- type safety weaker
- customer UI mapping fragile
- historical booking snapshots harder

Therefore:

```text
Generic category data
    -> detailSections

Catering structured data
    -> CateringDetails + VendorCateringMenu
```

---

# 39. Catering Packages

Existing generic packages support:

```text
SILVER
GOLD
PREMIUM
```

Current validation:

- maximum 3 packages
- no duplicate package types
- UUID package IDs
- package price
- package features
- active state

Catering packages may eventually reference menu item IDs:

```json
{
  "type": "GOLD",
  "price": 850,
  "features": ["Welcome drink", "Buffet service"],
  "menuItemIds": ["...","..."],
  "active": true
}
```

Do not implement until the current ServicePackage implementation is reviewed.

---

# 40. Catering Price Calculation

Basic agreed formula:

```text
sum(selected dish price per person)
× number of persons
```

Example:

```text
Paneer Butter Masala = 180
Chicken Biryani      = 220
Soup                 = 60

Dish total per person = 460

100 persons:
460 × 100 = 46,000
```

Staff:

```text
50 × 100 = 5,000
```

Total:

```text
46,000 + 5,000 = 51,000
```

The backend must recalculate this.

Frontend totals are display-only.

---

# 41. Catering Backend Price Authority

Never trust a client-supplied final amount.

Booking request should contain selections.

Backend should:

1. load authoritative vendor menu
2. validate selected dishes
3. load current prices
4. calculate dish totals
5. calculate staff charge
6. apply package/pricing rules
7. apply discounts
8. generate final total
9. save a historical snapshot

---

# 42. Historical Booking Snapshot

Critical future requirement.

If vendor changes:

```text
Paneer Butter Masala
180 -> 220
```

an old booking must remain at the original price.

Booking should snapshot:

```text
dishId
dishName
pricePerPerson
quantity/person count
lineTotal
staff cost
package
discount
final total
```

---

# 43. Existing Pricing Engine

Current pricing flow:

```text
Load service
    |
Load applicable VendorServicePricing
    |
Base amount
    |
Pricing heads
    |
Subtotal
    |
Normal discounts
    |
Bundle discount
    |
Total discount
    |
Final total
    |
Advance
    |
Balance
```

Catering integration must explicitly decide whether dish total becomes:

```text
the pricing base
```

or:

```text
an additional pricing component
```

to avoid double charging.

---

# 44. Bundle Discounts

Service supports:

```text
bundleEnabled
bundleDiscountType
bundleDiscountValue
```

Bundle discount belongs to the individual service.

Multiple selected services can be calculated independently.

---

# 45. Public Pricing API

Pricing APIs include routes under:

```text
/api/pricing/**
```

They are intentionally public.

A missing pricing record is a business/configuration problem, not authentication.

---

# 46. Existing Booking Calendar

Calendar:

- groups by eventDate
- month navigation
- selected date
- status dots
- booking count
- day booking cards
- payment details
- booking status
- View Details behavior

BookingStats:

```text
id
bookingNumber
customerName
customerPhone
customerEmail
serviceName
venue
eventDate
guestCount
amount
paidAmount
paymentStatus
notes
status
```

Status:

```text
Pending
Upcoming
Confirmed
Completed
Cancelled
```

Payment:

```text
Pending
Paid
Refunded
```

A more clickable booking card / “View Booking Summary” was discussed but should be verified before assuming it is applied.

Time/slot visibility is a possible future enhancement.

---

# 47. UI/UX Principles

Preserve existing EventNest visual language:

- white backgrounds/cards
- light borders
- rounded corners
- blue primary accents
- numbered section headings
- clean spacing
- reusable components
- no unnecessary tabs
- internal scrolling for large lists
- consistent input/button styling

Do not redesign working Hall/Photography screens just to add Catering.

---

# 48. Component Design Principles

Prefer:

```text
CategorySpecificSection
    |
    +-- HallDetails
    +-- PhotographyDetails
    +-- CateringDetails
```

rather than one giant component.

Complex categories should own their complex state.

Generic `handleDetailChange()` should remain for generic detailSections.

Catering should have dedicated handlers.

---

# 49. Suggested Catering Form State

Conceptual:

```ts
interface CateringDetailsForm {
    vegetarian: boolean;
    nonVegetarian: boolean;
    cuisines: string[];
    menuItems: CateringMenuItemForm[];
    providesCateringStaff: boolean;
    staffCostPerPerson: string;
    maximumServiceDistanceKm: string;
}
```

Menu item:

```ts
interface CateringMenuItemForm {
    id?: string;
    dishId?: string;
    customName?: string;
    cuisine: string;
    category: string;
    foodType: string;
    pricePerPerson: string;
    active: boolean;
    selected: boolean;
}
```

Exact types can be refined during implementation.

---

# 50. Suggested Catering APIs

Likely direction:

```text
GET    /api/vendor/services/{serviceId}/catering-menu
PUT    /api/vendor/services/{serviceId}/catering-menu

GET    /api/customer/services/{serviceId}/catering-menu

GET    /api/catering/dishes
POST   /api/catering/dishes
PUT    /api/catering/dishes/{id}
PATCH  /api/catering/dishes/{id}/status
```

Exact paths should follow existing project conventions.

---

# 51. Customer Catering Flow

```text
Customer opens catering service
        |
Check service details/distance
        |
Select event date
        |
Enter guest count
        |
Choose package or individual dishes
        |
Select cuisine/food type
        |
Select dishes
        |
Optional staff
        |
Calculate
        |
Review
        |
POST booking
```

Customer must see only dishes offered by the selected vendor.

---

# 52. Service Staff / Distance Future Logic

Future enhancements can include:

- staff-to-guest ratios
- delivery charges
- setup charges
- equipment charges
- distance-based fees
- minimum guest count
- minimum order amount

These are not part of the initial catering implementation unless requested.

---

# 53. Other Existing Vendor Services

Authorization is intended for:

```text
SERVICES
BOOKINGS
REVIEWS
REVENUE
BUNDLES
PROFILE
SETTINGS
DASHBOARD
```

Service-specific backend checks should remain centralized in service layer.

---

# 54. Admin Vendor Verification

Admin vendor verification operates against:

```text
User.role == VENDOR_ADMIN
```

Vendor response should expose:

```text
vendorId = VendorAdmin User._id
```

not VendorAccount._id.

---

# 55. Reviews

Vendor review operations:

```text
REVIEWS VIEW
REVIEWS EDIT
```

Replies require edit permission.

Customer review creation is customer-side functionality.

---

# 56. Revenue

Vendor revenue operations require:

```text
REVENUE VIEW
```

for summary/monthly/payment history.

---

# 57. Dashboard

Vendor dashboard requires:

```text
DASHBOARD VIEW
```

and uses canonical VendorAdmin identity.

---

# 58. Bundles

Bundle operations require:

```text
BUNDLES VIEW
BUNDLES EDIT
```

Vendor ownership must be validated.

Customer-facing bundle retrieval can remain public where intended.

---

# 59. Service Settings

Service settings require:

```text
SETTINGS VIEW
SETTINGS EDIT
```

Service ownership must be validated against effective vendor.

---

# 60. Error Handling Principles

Never map:

```text
business failure -> 401
```

Correct semantics matter because frontend 401 handling may destroy a valid session.

Use:

```text
401 = authentication
403 = authorization
400 = invalid/business request
404 = missing resource
```

---

# 61. MongoDB Design Principles

Embed small, tightly coupled objects:

- contact information
- availability
- booking settings
- catering settings
- package metadata

Separate collections for:

- global dish catalog
- independently managed large menu data
- historical/snapshot records
- independently queried datasets

100–200 compact menu references per vendor are not inherently too large, but separate menu storage is preferred for maintainability and independent management.

---

# 62. Likely MongoDB Indexes

Potential indexes:

```text
VendorService.vendorId
VendorService.category
VendorService.active

VendorCateringMenu.serviceId
VendorCateringMenu.vendorId

CateringDish.cuisine
CateringDish.category
CateringDish.foodType
CateringDish.active

Booking.vendorId
Booking.customerId
Booking.eventDate
```

Finalize based on real query patterns.

---

# 63. Future Catering Features

Potential future enhancements:

- menu search
- cuisine filtering
- food-type filtering
- bulk price update
- menu templates
- duplicate menu
- import/export
- seasonal menus
- date-based menu availability
- breakfast/lunch/dinner
- dietary tags
- Jain
- vegan
- gluten-free
- allergen information
- delivery/setup charges
- minimum order
- staff ratio
- equipment charges

Not part of initial scope unless explicitly requested.

---

# 64. Business Questions to Decide Before Advanced Catering

1. Can customers select individual dishes without a package?
2. Can a package contain arbitrary dishes?
3. Can customers mix package and individual dishes?
4. Is all catering pricing per person?
5. Is there a minimum guest count?
6. Is there a minimum order amount?
7. Does staff count depend on guest count?
8. Is staff optional?
9. Can multiple cuisines be mixed?
10. Does distance affect price or only eligibility?
11. Are delivery/setup charges separate?
12. Are taxes included?
13. Can vendors schedule menu availability?
14. Can vendors temporarily disable individual dishes?

---

# 65. Development Rules

## Preserve working functionality

When adding a category:

- do not rewrite Hall
- do not rewrite Photography
- do not redesign Add Service unnecessarily
- reuse existing components
- make incremental changes

## Backend authorization

Always check:

```text
effective vendor
ownership
VendorPage permission
Support Mode
```

## Frontend authorization

Frontend controls UX only.

Backend remains authoritative.

## Pricing

Frontend calculation is never authoritative.

## Booking

Historical price/menu snapshots are required.

---

# 66. Architecture Diagram — Vendor Service

```text
VendorAddService
      |
      +-- BasicInfoSection
      +-- ServiceDetailsSection
      +-- CategorySpecificSection
      |       +-- Hall
      |       +-- Photography
      |       +-- Catering
      +-- ImageUploader
      +-- ContactSection
      |
      v
VendorServiceMapper
      |
      v
VendorServiceService
      |
      v
VendorOfferingServiceImpl
      |
      +-- VendorPermissionService
      +-- VendorAccessService
      +-- VendorServiceRepository
      |
      v
MongoDB
```

---

# 67. Architecture Diagram — Catering

```text
VendorService
    |
    +-- CateringDetails
    |
    +-- Service Packages
    |
    +-- VendorCateringMenu
             |
             +-- dishId
             +-- price
             +-- active
             +-- custom dish
                     |
                     v
              CateringDish Master
                     |
              +------+------+------+
              |      |      |      |
           Indian Arabian Chinese ...
```

---

# 68. Architecture Diagram — Booking

```text
Customer
   |
   v
Service
   |
   v
Catering Selection
   |
   +-- guest count
   +-- dishes
   +-- package
   +-- staff
   |
   v
Backend
   |
   +-- authenticate
   +-- validate service
   +-- validate menu
   +-- recalculate
   +-- discounts
   +-- snapshot
   |
   v
Booking
```

---

# 69. Data Relationship Diagram

```text
User
 |
 +-- VENDOR_ADMIN
 |       |
 |       +-- VendorAccount.vendorAdminId
 |       +-- VendorService.vendorId
 |       +-- VendorCateringMenu.vendorId
 |       +-- VendorSupportSession.vendorId
 |       +-- VendorUser.vendorId
 |
 +-- VENDOR_USER
         |
         +-- vendorId -> VendorAdmin User._id

VendorService
 |
 +-- detailSections
 +-- cateringDetails
 +-- packages
 +-- pricing
 |
 +-- VendorCateringMenu.serviceId
          |
          +-- menu items
                 |
                 +-- CateringDish
```

---

# 70. Current/Agreed Implementation Areas

Backend:

- canonical vendor identity
- VendorAccount relationship
- Vendor access
- Vendor permissions
- Support Mode
- Vendor team
- service ownership
- bundles
- reviews
- settings
- profile
- revenue
- dashboard
- booking authorization
- security matchers
- 403 handling

Frontend:

- Axios JWT
- 401/403 distinction
- Vendor service 403 messages
- VendorLayout permissions
- VendorSidebar Team visibility
- Add Service workflow
- generic category details
- Hall/Photography UI
- booking calendar base UI

---

# 71. Pending Catering Work

Not yet treated as completed:

- CateringDetails model
- CateringDish master model
- VendorCateringMenu model
- repositories
- DTOs
- mapper
- vendor catering API
- frontend catering state
- CateringDetailsSection
- cuisine UI
- menu item selection
- prices
- internal scrolling
- custom dishes
- staff option
- distance
- package/menu relationship
- customer catering UI
- backend catering calculation
- booking snapshot
- validation
- distance eligibility

---

# 72. Items to Verify in Current Working Tree

Before assuming previous discussions are applied, verify:

- VendorAccountServiceImpl uses findByVendorAdminId
- GlobalExceptionHandler maps IllegalStateException correctly
- VendorTeamServiceImpl supports ADMIN in Support Mode
- Booking group access validation exists
- Revenue permission checks exist
- Dashboard permission checks exist
- latest SecurityConfig
- latest JwtAuthenticationFilter
- current VendorServiceMapper implementation
- current ServicePackage implementation

---

# 73. Testing Strategy

Frontend:

- create catering service
- edit catering service
- food types
- cuisines
- dish selection
- dish pricing
- custom dish
- menu scrolling
- staff toggle
- staff price
- distance
- validation
- API failures
- 403 behavior

Backend:

- menu CRUD
- vendor ownership
- VendorUser permissions
- Support Mode
- customer menu retrieval
- inactive dish validation
- price recalculation
- package validation
- staff calculation
- distance validation
- booking snapshots
- cross-vendor access prevention

---

# 74. Security Test Matrix

```text
Action                         Customer  VendorAdmin  VendorUser  Admin
----------------------------------------------------------------------
View public service              Yes        Yes          Yes       Yes
Create vendor service             No        Yes       Permission   Support
Edit vendor service               No        Yes       Permission   Support
Manage vendor team                No        Yes           No       Support
View vendor bookings              No        Yes       Permission   Support
Create customer booking          Yes         No           No        No
Admin verification                No         No           No        Yes
```

Exact endpoint/service rules remain authoritative.

---

# 75. Future Architecture Improvements

Potential future work:

- centralized error codes
- audit logging
- API versioning
- caching
- search/indexing
- notification architecture
- object storage abstraction
- event-driven workflows
- vendor analytics
- moderation audit trail
- advanced search

Do not implement automatically.

---

# 76. Immediate Next Feature

The next planned implementation is Catering inside:

```text
Vendor Add Service
  -> Category Specific Details
      -> Catering
```

Initial scope:

```text
Food type
Cuisine
Main Course
Soup
Salad
Dessert
Per-dish price
Custom dishes
Catering staff
Staff price/person
Maximum service distance
Vendor-specific packages
```

Menu lists must scroll internally.

No separate top-level Catering tab.

---

# 77. Recommended Catering Implementation Order

```text
1. Domain models
   |
   +-- CateringDetails
   +-- CateringDish
   +-- CateringMenuItem
   +-- VendorCateringMenu
   |
2. Repositories
   |
3. DTOs
   |
4. Vendor catering service/API
   |
5. Vendor frontend
   |
   +-- CateringDetailsSection
   +-- food type
   +-- cuisines
   +-- menu cards
   +-- prices
   +-- custom dishes
   +-- staff
   +-- distance
   |
6. Packages
   |
7. Customer catering UI
   |
8. Backend pricing
   |
9. Booking snapshot
   |
10. Security/edge-case tests
```

---

# 78. Maintenance Checklist

Before changing vendor-owned functionality:

- Confirm canonical vendor ID.
- Confirm effective vendor.
- Confirm VendorPage permission.
- Confirm Support Mode.
- Confirm VendorUser behavior.
- Confirm ownership query includes vendor ID.
- Confirm ADMIN cannot accidentally access another vendor.
- Confirm 403 does not logout.

Before changing pricing:

- Confirm price owner.
- Confirm date applicability.
- Confirm package interaction.
- Confirm discounts.
- Confirm frontend is not authoritative.
- Confirm historical booking snapshot.

Before changing category UI:

- inspect reusable components
- preserve existing styling
- preserve Hall/Photography
- keep complex categories structured
- avoid overloading generic detailSections

---

# 79. Guidance for Future ChatGPT Sessions

When continuing EventNest in another chat, preserve these exact architectural facts:

```text
VendorAdmin User._id is canonical vendorId.

VendorAccount._id is NOT canonical vendorId.

VendorAdmin has implicit full vendor permissions.

VendorUser has page-level permissions.

ADMIN Support Mode uses effectiveVendorId.

Authenticated but unauthorized means 403, not logout.

Catering stays inside Category Specific Details.

Catering is a dedicated category-specific component.

Catering menu is structured data, not generic detailSections.

Use a global dish catalog plus vendor-specific menu pricing.

Backend recalculates customer prices.

Bookings require historical price/menu snapshots.

Preserve existing UI/design and implement incrementally.
```

---

# 80. Final Architecture Summary

```text
                    +----------------+
                    |     ADMIN      |
                    +-------+--------+
                            |
                       Support Mode
                            |
                            v
                     Effective Vendor
                            |
              +-------------+-------------+
              |                           |
              v                           v
        VendorAdmin                  VendorUsers
        Full Access              Page Permissions
              |
              v
       Vendor-owned data
              |
       +------+------+------+------+------+
       |      |      |      |      |      |
    Services Pricing Booking Reviews Team Catering
```

The project intentionally favors:

- simple roles
- canonical vendor identity
- service-layer authorization
- explicit ownership checks
- reusable category components
- structured data for complex domains
- small embedded objects
- separate collections for large/reusable data
- backend-authoritative calculations
- immutable booking snapshots
- incremental implementation
- preservation of existing UI

This document should be treated as a living architecture and maintenance document. Significant decisions should be added here so future developers and future ChatGPT sessions can continue the project without reconstructing the architecture from old conversations.
