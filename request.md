# API Request/Response Documentation

## Table of Contents
- [Order](#order)
- [OrderItem](#orderitem)
- [Product](#product)
- [Shipment](#shipment)
- [TrackingLog](#trackinglog)
- [Notes](#notes)
- [NoteTag](#notetag)
- [User](#user)

---

## Order

### Create Order
**Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "customerId": 1,
  "totalAmount": 150.50,
  "paymentStatus": "PENDING",
  "deliveryAddress": "123 Main St, City"
}
```

**Response Body (201 Created):**
```json
{
  "orderId": 1,
  "customerId": 1,
  "totalAmount": 150.50,
  "paymentStatus": "PENDING",
  "deliveryAddress": "123 Main St, City"
}
```

### Get All Orders
**Endpoint:** `GET /api/orders`

**Response Body (200 OK):**
```json
[
  {
    "orderId": 1,
    "customerId": 1,
    "totalAmount": 150.50,
    "paymentStatus": "PENDING",
    "deliveryAddress": "123 Main St, City"
  },
  {
    "orderId": 2,
    "customerId": 2,
    "totalAmount": 200.00,
    "paymentStatus": "PAID",
    "deliveryAddress": "456 Oak Ave, Town"
  }
]
```

### Get Order by ID
**Endpoint:** `GET /api/orders/{id}`

**Response Body (200 OK):**
```json
{
  "orderId": 1,
  "customerId": 1,
  "totalAmount": 150.50,
  "paymentStatus": "PENDING",
  "deliveryAddress": "123 Main St, City"
}
```

### Update Order
**Endpoint:** `PUT /api/orders/{id}`

**Request Body:**
```json
{
  "customerId": 1,
  "totalAmount": 160.00,
  "paymentStatus": "PAID",
  "deliveryAddress": "123 Main St, City"
}
```

**Response Body (200 OK):**
```json
{
  "orderId": 1,
  "customerId": 1,
  "totalAmount": 160.00,
  "paymentStatus": "PAID",
  "deliveryAddress": "123 Main St, City"
}
```

### Delete Order
**Endpoint:** `DELETE /api/orders/{id}`

**Response:** 204 No Content

---

## OrderItem

### Create OrderItem
**Endpoint:** `POST /api/order-items`

**Request Body:**
```json
{
  "orderId": 1,
  "productId": 5,
  "quantity": 2,
  "pricePerUnit": 75.25
}
```

**Response Body (201 Created):**
```json
{
  "orderItemId": 1,
  "orderId": 1,
  "productId": 5,
  "quantity": 2,
  "pricePerUnit": 75.25
}
```

### Get All OrderItems
**Endpoint:** `GET /api/order-items`

**Response Body (200 OK):**
```json
[
  {
    "orderItemId": 1,
    "orderId": 1,
    "productId": 5,
    "quantity": 2,
    "pricePerUnit": 75.25
  },
  {
    "orderItemId": 2,
    "orderId": 1,
    "productId": 6,
    "quantity": 1,
    "pricePerUnit": 99.99
  }
]
```

### Get OrderItem by ID
**Endpoint:** `GET /api/order-items/{id}`

**Response Body (200 OK):**
```json
{
  "orderItemId": 1,
  "orderId": 1,
  "productId": 5,
  "quantity": 2,
  "pricePerUnit": 75.25
}
```

### Update OrderItem
**Endpoint:** `PUT /api/order-items/{id}`

**Request Body:**
```json
{
  "orderId": 1,
  "productId": 5,
  "quantity": 3,
  "pricePerUnit": 75.25
}
```

**Response Body (200 OK):**
```json
{
  "orderItemId": 1,
  "orderId": 1,
  "productId": 5,
  "quantity": 3,
  "pricePerUnit": 75.25
}
```

### Delete OrderItem
**Endpoint:** `DELETE /api/order-items/{id}`

**Response:** 204 No Content

---

## Product

### Create Product
**Endpoint:** `POST /api/products`

**Request Body:**
```json
{
  "sellerId": 2,
  "productName": "Laptop",
  "price": 999.99,
  "stock": 10
}
```

**Response Body (201 Created):**
```json
{
  "productId": 1,
  "sellerId": 2,
  "productName": "Laptop",
  "price": 999.99,
  "stock": 10
}
```

### Get All Products
**Endpoint:** `GET /api/products`

**Response Body (200 OK):**
```json
[
  {
    "productId": 1,
    "sellerId": 2,
    "productName": "Laptop",
    "price": 999.99,
    "stock": 10
  },
  {
    "productId": 2,
    "sellerId": 2,
    "productName": "Mouse",
    "price": 29.99,
    "stock": 50
  }
]
```

### Get Product by ID
**Endpoint:** `GET /api/products/{id}`

**Response Body (200 OK):**
```json
{
  "productId": 1,
  "sellerId": 2,
  "productName": "Laptop",
  "price": 999.99,
  "stock": 10
}
```

### Update Product
**Endpoint:** `PUT /api/products/{id}`

**Request Body:**
```json
{
  "sellerId": 2,
  "productName": "Laptop",
  "price": 899.99,
  "stock": 8
}
```

**Response Body (200 OK):**
```json
{
  "productId": 1,
  "sellerId": 2,
  "productName": "Laptop",
  "price": 899.99,
  "stock": 8
}
```

### Delete Product
**Endpoint:** `DELETE /api/products/{id}`

**Response:** 204 No Content

---

## Shipment

### Create Shipment
**Endpoint:** `POST /api/shipments`

**Request Body:**
```json
{
  "orderId": 1,
  "riderId": 3,
  "shipmentStatus": "PENDING_SELLER"
}
```

**Response Body (201 Created):**
```json
{
  "shipmentId": 1,
  "orderId": 1,
  "riderId": 3,
  "shipmentStatus": "PENDING_SELLER",
  "trackingLogs": []
}
```

### Get All Shipments
**Endpoint:** `GET /api/shipments`

**Response Body (200 OK):**
```json
[
  {
    "shipmentId": 1,
    "orderId": 1,
    "riderId": 3,
    "shipmentStatus": "IN_TRANSIT",
    "trackingLogs": [
      {
        "logId": 1,
        "shipmentId": 1,
        "statusChangedTo": "PROCESSING",
        "description": "Order is being processed",
        "updatedByUserId": 3
      },
      {
        "logId": 2,
        "shipmentId": 1,
        "statusChangedTo": "IN_TRANSIT",
        "description": "Package picked up by rider",
        "updatedByUserId": 3
      }
    ]
  }
]
```

### Get Shipment by ID
**Endpoint:** `GET /api/shipments/{id}`

**Response Body (200 OK):**
```json
{
  "shipmentId": 1,
  "orderId": 1,
  "riderId": 3,
  "shipmentStatus": "IN_TRANSIT",
  "trackingLogs": [
    {
      "logId": 1,
      "shipmentId": 1,
      "statusChangedTo": "PROCESSING",
      "description": "Order is being processed",
      "updatedByUserId": 3
    },
    {
      "logId": 2,
      "shipmentId": 1,
      "statusChangedTo": "IN_TRANSIT",
      "description": "Package picked up by rider",
      "updatedByUserId": 3
    }
  ]
}
```

### Update Shipment
**Endpoint:** `PUT /api/shipments/{id}`

**Request Body:**
```json
{
  "orderId": 1,
  "riderId": 3,
  "shipmentStatus": "DELIVERED"
}
```

**Response Body (200 OK):**
```json
{
  "shipmentId": 1,
  "orderId": 1,
  "riderId": 3,
  "shipmentStatus": "DELIVERED",
  "trackingLogs": [
    {
      "logId": 1,
      "shipmentId": 1,
      "statusChangedTo": "PROCESSING",
      "description": "Order is being processed",
      "updatedByUserId": 3
    }
  ]
}
```

### Delete Shipment
**Endpoint:** `DELETE /api/shipments/{id}`

**Response:** 204 No Content

---

## TrackingLog

### Create TrackingLog
**Endpoint:** `POST /api/tracking-logs`

**Request Body:**
```json
{
  "shipmentId": 1,
  "statusChangedTo": "IN_TRANSIT",
  "description": "Package picked up by rider",
  "updatedByUserId": 3
}
```

**Response Body (201 Created):**
```json
{
  "logId": 2,
  "shipmentId": 1,
  "statusChangedTo": "IN_TRANSIT",
  "description": "Package picked up by rider",
  "updatedByUserId": 3
}
```

### Get All TrackingLogs
**Endpoint:** `GET /api/tracking-logs`

**Response Body (200 OK):**
```json
[
  {
    "logId": 1,
    "shipmentId": 1,
    "statusChangedTo": "PROCESSING",
    "description": "Order is being processed",
    "updatedByUserId": 3
  },
  {
    "logId": 2,
    "shipmentId": 1,
    "statusChangedTo": "IN_TRANSIT",
    "description": "Package picked up by rider",
    "updatedByUserId": 3
  }
]
```

### Get TrackingLog by ID
**Endpoint:** `GET /api/tracking-logs/{id}`

**Response Body (200 OK):**
```json
{
  "logId": 1,
  "shipmentId": 1,
  "statusChangedTo": "PROCESSING",
  "description": "Order is being processed",
  "updatedByUserId": 3
}
```

### Update TrackingLog
**Endpoint:** `PUT /api/tracking-logs/{id}`

**Request Body:**
```json
{
  "shipmentId": 1,
  "statusChangedTo": "DELIVERED",
  "description": "Package delivered successfully",
  "updatedByUserId": 3
}
```

**Response Body (200 OK):**
```json
{
  "logId": 1,
  "shipmentId": 1,
  "statusChangedTo": "DELIVERED",
  "description": "Package delivered successfully",
  "updatedByUserId": 3
}
```

### Delete TrackingLog
**Endpoint:** `DELETE /api/tracking-logs/{id}`

**Response:** 204 No Content

---

## Notes

### Create Note
**Endpoint:** `POST /api/notes`

**Request Body:**
```json
{
  "name": "Spring Boot Notes",
  "description": "Collection of Spring Boot references and tutorials",
  "link": "https://spring.io",
  "category": "Backend",
  "license": "MIT",
  "verified": true,
  "tags": [
    {
      "tag": "Java"
    },
    {
      "tag": "Framework"
    }
  ]
}
```

**Response Body (201 Created):**
```json
{
  "id": 1,
  "name": "Spring Boot Notes",
  "description": "Collection of Spring Boot references and tutorials",
  "link": "https://spring.io",
  "category": "Backend",
  "license": "MIT",
  "verified": true,
  "tags": [
    {
      "id": 1,
      "tag": "Java",
      "noteId": 1
    },
    {
      "id": 2,
      "tag": "Framework",
      "noteId": 1
    }
  ]
}
```

### Get All Notes
**Endpoint:** `GET /api/notes`

**Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Spring Boot Notes",
    "description": "Collection of Spring Boot references",
    "link": "https://spring.io",
    "category": "Backend",
    "license": "MIT",
    "verified": true,
    "tags": [
      {
        "id": 1,
        "tag": "Java",
        "noteId": 1
      }
    ]
  },
  {
    "id": 2,
    "name": "React Basics",
    "description": "Frontend framework notes",
    "link": "https://react.dev",
    "category": "Frontend",
    "license": "MIT",
    "verified": true,
    "tags": [
      {
        "id": 3,
        "tag": "JavaScript",
        "noteId": 2
      }
    ]
  }
]
```

### Get Note by ID
**Endpoint:** `GET /api/notes/{id}`

**Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "Spring Boot Notes",
  "description": "Collection of Spring Boot references",
  "link": "https://spring.io",
  "category": "Backend",
  "license": "MIT",
  "verified": true,
  "tags": [
    {
      "id": 1,
      "tag": "Java",
      "noteId": 1
    }
  ]
}
```

### Update Note
**Endpoint:** `PUT /api/notes/{id}`

**Request Body:**
```json
{
  "name": "Spring Boot Advanced",
  "description": "Advanced Spring Boot concepts",
  "link": "https://spring.io",
  "category": "Backend",
  "license": "MIT",
  "verified": true,
  "tags": [
    {
      "tag": "Java"
    }
  ]
}
```

**Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "Spring Boot Advanced",
  "description": "Advanced Spring Boot concepts",
  "link": "https://spring.io",
  "category": "Backend",
  "license": "MIT",
  "verified": true,
  "tags": [
    {
      "id": 1,
      "tag": "Java",
      "noteId": 1
    }
  ]
}
```

### Delete Note
**Endpoint:** `DELETE /api/notes/{id}`

**Response:** 204 No Content

---

## NoteTag

### Create NoteTag
**Endpoint:** `POST /api/note-tags`

**Request Body:**
```json
{
  "tag": "Java",
  "noteId": 1
}
```

**Response Body (201 Created):**
```json
{
  "id": 1,
  "tag": "Java",
  "noteId": 1
}
```

### Get All NoteTags
**Endpoint:** `GET /api/note-tags`

**Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "tag": "Java",
    "noteId": 1
  },
  {
    "id": 2,
    "tag": "Framework",
    "noteId": 1
  },
  {
    "id": 3,
    "tag": "JavaScript",
    "noteId": 2
  }
]
```

### Get NoteTag by ID
**Endpoint:** `GET /api/note-tags/{id}`

**Response Body (200 OK):**
```json
{
  "id": 1,
  "tag": "Java",
  "noteId": 1
}
```

### Update NoteTag
**Endpoint:** `PUT /api/note-tags/{id}`

**Request Body:**
```json
{
  "tag": "Java 17",
  "noteId": 1
}
```

**Response Body (200 OK):**
```json
{
  "id": 1,
  "tag": "Java 17",
  "noteId": 1
}
```

### Delete NoteTag
**Endpoint:** `DELETE /api/note-tags/{id}`

**Response:** 204 No Content

---

## User

### Get All Users
**Endpoint:** `GET /api/users`

**Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "username": "john_seller",
    "role": "SELLER"
  },
  {
    "id": 3,
    "username": "rider_mike",
    "role": "RIDER"
  }
]
```

### Get User by ID
**Endpoint:** `GET /api/users/{id}`

**Response Body (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN"
}
```

---

## HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | OK - Successful GET, PUT request |
| 201 | Created - Successful POST request |
| 204 | No Content - Successful DELETE request |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Server error |

---

## Valid Enum Values

### PaymentStatus
- `PENDING`
- `FAILED`
- `PAID`

### ShipmentStatus
- `PENDING_SELLER`
- `PROCESSING`
- `READY_FOR_PICKUP`
- `IN_TRANSIT`
- `DELIVERED`
- `CANCELLED`

### Role
- `CUSTOMER`
- `SELLER`
- `RIDER`
- `ADMIN`
