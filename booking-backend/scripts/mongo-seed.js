// Run with:
//   mongosh mongodb://localhost:27017/Catalog ./scripts/mongo-seed.js
//
// This creates the MongoDB collections used by the Spring Boot app and inserts
// a small sample document in each collection if it is empty.

const dbName = "Catalog";
const db = db.getSiblingDB(dbName);

const collections = [
  {
    name: "users",
    docs: [
      {
        email: "admin@demo.com",
        password: "change-me",
        firstName: "System",
        lastName: "Admin",
        phone: "+1234567890",
        role: "ADMIN",
        status: "ACTIVE",
        verified: true,
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "vendor_services",
    docs: [
      {
        vendorId: "vendor-demo-001",
        serviceName: "Wedding Catering Deluxe",
        category: "CATERING",
        description: "Premium wedding catering service",
        price: 1200,
        capacity: 200,
        durationHours: 6,
        displayOrder: 1,
        location: "Downtown",
        moderationStatus: "APPROVED",
        bundleEnabled: false,
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "bookings",
    docs: [
      {
        bookingNumber: "BK-1001",
        vendorId: "vendor-demo-001",
        customerId: "customer-demo-001",
        serviceId: "service-demo-001",
        serviceName: "Wedding Catering Deluxe",
        eventDate: new Date("2026-10-01T00:00:00.000Z"),
        guestCount: 150,
        status: "PENDING",
        paymentStatus: "PENDING",
        eventType: "Wedding",
        customerName: "Jane Doe",
        customerPhone: "+15551234567",
        customerEmail: "jane@example.com",
        venue: "Grand Hall",
        totalAmount: 1200,
        paidAmount: 0,
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "booking_groups",
    docs: [
      {
        groupName: "Wedding Group",
        status: "OPEN",
        customerId: "customer-demo-001",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "bookingSlots",
    docs: [
      {
        serviceId: "service-demo-001",
        date: new Date("2026-10-01T00:00:00.000Z"),
        slotStart: "09:00",
        slotEnd: "12:00",
        availability: "AVAILABLE",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "bundles",
    docs: [
      {
        bundleName: "Wedding Essentials Bundle",
        description: "Catering + decoration + photography",
        vendorId: "vendor-demo-001",
        price: 3200,
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "notifications",
    docs: [
      {
        userId: "user-demo-001",
        title: "Booking confirmation",
        message: "Your booking has been received.",
        read: false,
        type: "BOOKING",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "payment_transactions",
    docs: [
      {
        bookingId: "booking-demo-001",
        customerId: "customer-demo-001",
        amount: 1200,
        currency: "USD",
        status: "PENDING",
        paymentMethod: "CARD",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "reviews",
    docs: [
      {
        vendorId: "vendor-demo-001",
        customerId: "customer-demo-001",
        bookingId: "booking-demo-001",
        rating: 5,
        comment: "Excellent service and very professional team.",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "service_settings",
    docs: [
      {
        serviceId: "service-demo-001",
        autoApproval: true,
        notificationsEnabled: true,
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "availabilityOverrides",
    docs: [
      {
        serviceId: "service-demo-001",
        slotId: "slot-demo-001",
        date: new Date("2026-10-01T00:00:00.000Z"),
        isAvailable: true,
        reason: "Holiday schedule",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "vendor_service_pricing",
    docs: [
      {
        serviceId: "service-demo-001",
        vendorId: "vendor-demo-001",
        basePrice: 1200,
        currency: "USD",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "test",
    docs: [
      {
        message: "Mongo seed generated by app model scan",
        active: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

for (const collection of collections) {
  const col = db.getCollection(collection.name);
  if (!db.getCollectionNames().includes(collection.name)) {
    db.createCollection(collection.name);
  }

  if (col.countDocuments({}) === 0) {
    col.insertMany(collection.docs);
    print(`Created collection: ${collection.name} with ${collection.docs.length} sample document(s)`);
  } else {
    print(`Collection already has data: ${collection.name}. Skipping seed.`);
  }
}

print(`Mongo seed complete for database: ${dbName}`);
