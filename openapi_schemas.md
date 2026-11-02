# OpenAPI Schema Definitions

## VehicleRequest
`json
{
  "type": "object",
  "properties": {
    "brand": {
      "type": "string",
      "minLength": 1
    },
    "model": {
      "type": "string",
      "minLength": 1
    },
    "year": {
      "type": "integer",
      "format": "int32",
      "minimum": 1990
    },
    "licensePlate": {
      "type": "string",
      "minLength": 1
    },
    "pricePerKm": {
      "type": "integer",
      "format": "int32",
      "minimum": 1
    },
    "seatingCapacity": {
      "type": "integer",
      "format": "int32",
      "minimum": 1
    },
    "vehicleType": {
      "type": "string",
      "enum": [
        "SEDAN",
        "SUV",
        "HATCHBACK",
        "LUXURY",
        "COUPE",
        "VAN",
        "TRUCK"
      ]
    },
    "fuelType": {
      "type": "string",
      "enum": [
        "PETROL",
        "DIESEL",
        "ELECTRIC",
        "HYBRID",
        "CNG"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "APPROVED",
        "AVAILABLE",
        "BOOKED",
        "MAINTENANCE",
        "INACTIVE",
        "REJECTED"
      ]
    },
    "location": {
      "type": "string",
      "minLength": 1
    },
    "imageUrls": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "description": {
      "type": "string"
    }
  },
  "required": [
    "brand",
    "fuelType",
    "licensePlate",
    "location",
    "model",
    "pricePerKm",
    "seatingCapacity",
    "vehicleType",
    "year"
  ]
}
`

## ApiResponseVehicleResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/VehicleResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## VehicleResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "brand": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "year": {
      "type": "integer",
      "format": "int32"
    },
    "licensePlate": {
      "type": "string"
    },
    "pricePerKm": {
      "type": "integer",
      "format": "int32"
    },
    "seatingCapacity": {
      "type": "integer",
      "format": "int32"
    },
    "vehicleType": {
      "type": "string",
      "enum": [
        "SEDAN",
        "SUV",
        "HATCHBACK",
        "LUXURY",
        "COUPE",
        "VAN",
        "TRUCK"
      ]
    },
    "fuelType": {
      "type": "string",
      "enum": [
        "PETROL",
        "DIESEL",
        "ELECTRIC",
        "HYBRID",
        "CNG"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "APPROVED",
        "AVAILABLE",
        "BOOKED",
        "MAINTENANCE",
        "INACTIVE",
        "REJECTED"
      ]
    },
    "location": {
      "type": "string"
    },
    "imageUrls": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "description": {
      "type": "string"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## OwnerUpdateRequest
`json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "lastName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "phoneNumber": {
      "type": "string",
      "pattern": "^[+]?[0-9]{10,15}$"
    },
    "willingToDrive": {
      "type": "boolean"
    },
    "drivingLicenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    }
  }
}
`

## ApiResponseOwnerResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/OwnerResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## OwnerResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phoneNumber": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": [
        "CUSTOMER",
        "OWNER",
        "ADMIN",
        "DRIVER"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "APPROVED",
        "REJECTED"
      ]
    },
    "willingToDrive": {
      "type": "boolean"
    },
    "drivingLicenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## BookingStatusUpdateRequest
`json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REJECTED"
      ]
    },
    "reason": {
      "type": "string"
    },
    "rejectionReason": {
      "type": "string"
    },
    "bookingStatus": {
      "type": "string",
      "enum": [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REJECTED"
      ]
    }
  },
  "required": [
    "status"
  ]
}
`

## ApiResponseBookingResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/BookingResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## BookingResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "bookingReference": {
      "type": "string"
    },
    "customerId": {
      "type": "integer",
      "format": "int64"
    },
    "customerName": {
      "type": "string"
    },
    "customerEmail": {
      "type": "string"
    },
    "customerPhoneNumber": {
      "type": "string"
    },
    "vehicleId": {
      "type": "integer",
      "format": "int64"
    },
    "vehicleName": {
      "type": "string"
    },
    "vehicleLicensePlate": {
      "type": "string"
    },
    "driverId": {
      "type": "integer",
      "format": "int64"
    },
    "driverName": {
      "type": "string"
    },
    "driverPhoneNumber": {
      "type": "string"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    },
    "pickupLocation": {
      "type": "string"
    },
    "dropoffLocation": {
      "type": "string"
    },
    "tripType": {
      "type": "string",
      "enum": [
        "LOCAL",
        "OUTSTATION"
      ]
    },
    "passengerCount": {
      "type": "integer",
      "format": "int32"
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REJECTED"
      ]
    },
    "rejectionReason": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## CustomerUpdateRequest
`json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "lastName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "phoneNumber": {
      "type": "string",
      "pattern": "^[+]?[0-9]{10,15}$"
    },
    "address": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "postalCode": {
      "type": "string"
    }
  }
}
`

## ApiResponseCustomerResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/CustomerResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## CustomerResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phoneNumber": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": [
        "CUSTOMER",
        "OWNER",
        "ADMIN",
        "DRIVER"
      ]
    },
    "address": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "postalCode": {
      "type": "string"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## DriverRequest
`json
{
  "type": "object",
  "properties": {
    "licenseNumber": {
      "type": "string",
      "minLength": 1
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "APPROVED",
        "AVAILABLE",
        "ON_TRIP",
        "OFFLINE",
        "REJECTED"
      ]
    }
  },
  "required": [
    "licenseExpiryDate",
    "licenseNumber"
  ]
}
`

## ApiResponseDriverResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/DriverResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## DriverResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phoneNumber": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": [
        "CUSTOMER",
        "OWNER",
        "ADMIN",
        "DRIVER"
      ]
    },
    "drivingLicenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "APPROVED",
        "AVAILABLE",
        "ON_TRIP",
        "OFFLINE",
        "REJECTED"
      ]
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## DriverAssignmentRequest
`json
{
  "type": "object",
  "properties": {
    "driverId": {
      "type": "integer",
      "format": "int64"
    }
  },
  "required": [
    "driverId"
  ]
}
`

## BookingRequest
`json
{
  "type": "object",
  "properties": {
    "vehicleId": {
      "type": "integer",
      "format": "int64"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    },
    "pickupLocation": {
      "type": "string",
      "minLength": 1
    },
    "dropoffLocation": {
      "type": "string",
      "minLength": 1
    },
    "customerPhoneNumber": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[+]?[0-9]{10,15}$"
    },
    "tripType": {
      "type": "string",
      "enum": [
        "LOCAL",
        "OUTSTATION"
      ]
    },
    "passengerCount": {
      "type": "integer",
      "format": "int32",
      "minimum": 1
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "customerPhoneNumber",
    "dropoffLocation",
    "endDate",
    "passengerCount",
    "pickupLocation",
    "startDate",
    "tripType",
    "vehicleId"
  ]
}
`

## VerifyEmailRequest
`json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "minLength": 1
    },
    "otp": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[0-9]{6}$"
    }
  },
  "required": [
    "email",
    "otp"
  ]
}
`

## ApiResponseVoid
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {},
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ResetPasswordRequest
`json
{
  "type": "object",
  "properties": {
    "token": {
      "type": "string",
      "minLength": 1
    },
    "newPassword": {
      "type": "string",
      "maxLength": 100,
      "minLength": 6
    }
  },
  "required": [
    "newPassword",
    "token"
  ]
}
`

## ResendVerificationRequest
`json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "minLength": 1
    }
  },
  "required": [
    "email"
  ]
}
`

## RefreshTokenRequest
`json
{
  "type": "object",
  "properties": {
    "refreshToken": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "refreshToken"
  ]
}
`

## ApiResponseTokenRefreshResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/TokenRefreshResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## TokenRefreshResponse
`json
{
  "type": "object",
  "properties": {
    "accessToken": {
      "type": "string"
    },
    "refreshToken": {
      "type": "string"
    },
    "tokenType": {
      "type": "string"
    },
    "expiresIn": {
      "type": "integer",
      "format": "int64"
    }
  }
}
`

## OwnerSignupRequest
`json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "lastName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 100,
      "minLength": 0
    },
    "password": {
      "type": "string",
      "maxLength": 100,
      "minLength": 8
    },
    "confirmPassword": {
      "type": "string",
      "maxLength": 100,
      "minLength": 8
    },
    "phoneNumber": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[6-9]\\d{9}$"
    },
    "willingToDrive": {
      "type": "boolean"
    },
    "drivingLicenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    }
  },
  "required": [
    "confirmPassword",
    "email",
    "firstName",
    "lastName",
    "password",
    "phoneNumber"
  ]
}
`

## ApiResponseUserResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/UserResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## UserResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phoneNumber": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": [
        "CUSTOMER",
        "OWNER",
        "ADMIN",
        "DRIVER"
      ]
    },
    "emailVerified": {
      "type": "boolean"
    },
    "isActive": {
      "type": "boolean"
    },
    "enabled": {
      "type": "boolean"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## LoginRequest
`json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "minLength": 1
    },
    "password": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "email",
    "password"
  ]
}
`

## ApiResponseAuthResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AuthResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## AuthResponse
`json
{
  "type": "object",
  "properties": {
    "accessToken": {
      "type": "string"
    },
    "refreshToken": {
      "type": "string"
    },
    "tokenType": {
      "type": "string"
    },
    "expiresIn": {
      "type": "integer",
      "format": "int64"
    },
    "user": {
      "$ref": "#/components/schemas/UserResponse"
    }
  }
}
`

## ForgotPasswordRequest
`json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "minLength": 1
    }
  },
  "required": [
    "email"
  ]
}
`

## CustomerSignupRequest
`json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "lastName": {
      "type": "string",
      "maxLength": 50,
      "minLength": 2
    },
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 100,
      "minLength": 0
    },
    "password": {
      "type": "string",
      "maxLength": 100,
      "minLength": 8
    },
    "confirmPassword": {
      "type": "string",
      "maxLength": 100,
      "minLength": 8
    },
    "phoneNumber": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[6-9]\\d{9}$"
    }
  },
  "required": [
    "confirmPassword",
    "email",
    "firstName",
    "lastName",
    "password",
    "phoneNumber"
  ]
}
`

## AdminUserStatusUpdateRequest
`json
{
  "type": "object",
  "properties": {
    "enabled": {
      "type": "boolean"
    },
    "isActive": {
      "type": "boolean"
    },
    "emailVerified": {
      "type": "boolean"
    },
    "accountNonLocked": {
      "type": "boolean"
    }
  }
}
`

## ApprovalDecisionRequest
`json
{
  "type": "object",
  "properties": {
    "decision": {
      "type": "string",
      "enum": [
        "APPROVED",
        "REJECTED"
      ]
    },
    "reason": {
      "type": "string",
      "maxLength": 2000,
      "minLength": 0
    }
  },
  "required": [
    "decision"
  ]
}
`

## DriverStatusUpdateRequest
`json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "APPROVED",
        "AVAILABLE",
        "ON_TRIP",
        "OFFLINE",
        "REJECTED"
      ]
    }
  },
  "required": [
    "status"
  ]
}
`

## ApiResponseListVehicleResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/VehicleResponse"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponseListDriverResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DriverResponse"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponseListBookingResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/BookingResponse"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponseListUserResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserResponse"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## AdminDashboardStatsResponse
`json
{
  "type": "object",
  "properties": {
    "totalUsers": {
      "type": "integer",
      "format": "int64"
    },
    "totalCustomers": {
      "type": "integer",
      "format": "int64"
    },
    "totalOwners": {
      "type": "integer",
      "format": "int64"
    },
    "totalDrivers": {
      "type": "integer",
      "format": "int64"
    },
    "totalVehicles": {
      "type": "integer",
      "format": "int64"
    },
    "totalBookings": {
      "type": "integer",
      "format": "int64"
    },
    "activeBookings": {
      "type": "integer",
      "format": "int64"
    },
    "totalRevenue": {
      "type": "number"
    },
    "userCountByRole": {
      "type": "object",
      "additionalProperties": {
        "type": "integer",
        "format": "int64"
      }
    }
  }
}
`

## ApiResponseAdminDashboardStatsResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AdminDashboardStatsResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## Pageable
`json
{
  "type": "object",
  "properties": {
    "page": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    },
    "size": {
      "type": "integer",
      "format": "int32",
      "minimum": 1
    },
    "sort": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
`

## ApiResponsePageResponseOwnerSummaryResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponseOwnerSummaryResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## OwnerSummaryResponse
`json
{
  "type": "object",
  "properties": {
    "ownerId": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "businessName": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## PageResponseOwnerSummaryResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/OwnerSummaryResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## ApiResponseUnreadCountResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/UnreadCountResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## UnreadCountResponse
`json
{
  "type": "object",
  "properties": {
    "unreadCount": {
      "type": "integer",
      "format": "int64"
    }
  }
}
`

## AdminNotificationResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "notificationType": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "referenceType": {
      "type": "string"
    },
    "referenceId": {
      "type": "integer",
      "format": "int64"
    },
    "isRead": {
      "type": "boolean"
    },
    "readAt": {
      "type": "string",
      "format": "date-time"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponsePageResponseAdminNotificationResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponseAdminNotificationResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## PageResponseAdminNotificationResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/AdminNotificationResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## AdminProfileResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "roles": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponseAdminProfileResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AdminProfileResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponsePageResponseDriverSummaryResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponseDriverSummaryResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## DriverSummaryResponse
`json
{
  "type": "object",
  "properties": {
    "driverId": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "licenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "approvalStatus": {
      "type": "string"
    },
    "operationalStatus": {
      "type": "string"
    },
    "managingOwnerName": {
      "type": "string"
    },
    "managingOwnerEmail": {
      "type": "string"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## PageResponseDriverSummaryResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DriverSummaryResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## AdminDashboardResponse
`json
{
  "type": "object",
  "properties": {
    "totalOwners": {
      "type": "integer",
      "format": "int64"
    },
    "totalCustomers": {
      "type": "integer",
      "format": "int64"
    },
    "totalDrivers": {
      "type": "integer",
      "format": "int64"
    },
    "totalVehicles": {
      "type": "integer",
      "format": "int64"
    },
    "pendingVehicleApprovals": {
      "type": "integer",
      "format": "int64"
    },
    "pendingDriverApprovals": {
      "type": "integer",
      "format": "int64"
    },
    "pendingOwnerDriverApprovals": {
      "type": "integer",
      "format": "int64"
    },
    "totalPendingApprovals": {
      "type": "integer",
      "format": "int64"
    },
    "activeVehicles": {
      "type": "integer",
      "format": "int64"
    },
    "inactiveVehicles": {
      "type": "integer",
      "format": "int64"
    },
    "deletedAccounts": {
      "type": "integer",
      "format": "int64"
    }
  }
}
`

## ApiResponseAdminDashboardResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AdminDashboardResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## AdminVehicleDetailResponse
`json
{
  "type": "object",
  "properties": {
    "vehicleId": {
      "type": "integer",
      "format": "int64"
    },
    "vehicleName": {
      "type": "string"
    },
    "vehicleNumber": {
      "type": "string"
    },
    "brand": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "vehicleType": {
      "type": "string"
    },
    "modelYear": {
      "type": "integer",
      "format": "int32"
    },
    "seatingCapacity": {
      "type": "integer",
      "format": "int32"
    },
    "fuelType": {
      "type": "string"
    },
    "registrationDate": {
      "type": "string",
      "format": "date"
    },
    "ratePerKm": {
      "type": "number"
    },
    "acRatePerKm": {
      "type": "number"
    },
    "location": {
      "type": "string"
    },
    "features": {
      "type": "string"
    },
    "approvalStatus": {
      "type": "string"
    },
    "operationalStatus": {
      "type": "string"
    },
    "rejectionReason": {
      "type": "string"
    },
    "ownerId": {
      "type": "integer",
      "format": "int64"
    },
    "ownerName": {
      "type": "string"
    },
    "ownerEmail": {
      "type": "string"
    },
    "ownerMobileNumber": {
      "type": "string"
    },
    "ownerBusinessName": {
      "type": "string"
    },
    "documents": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DocumentResponse"
      }
    },
    "approvalHistory": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ApprovalRecordResponse"
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponseAdminVehicleDetailResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AdminVehicleDetailResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApprovalRecordResponse
`json
{
  "type": "object",
  "properties": {
    "decision": {
      "type": "string"
    },
    "reason": {
      "type": "string"
    },
    "decidedBy": {
      "type": "string"
    },
    "decidedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## DocumentResponse
`json
{
  "type": "object",
  "properties": {
    "documentId": {
      "type": "integer",
      "format": "int64"
    },
    "documentType": {
      "type": "string"
    },
    "fileUrl": {
      "type": "string"
    },
    "isPrimary": {
      "type": "boolean"
    },
    "uploadedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponsePageResponsePendingVehicleResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponsePendingVehicleResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## PageResponsePendingVehicleResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/PendingVehicleResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## PendingVehicleResponse
`json
{
  "type": "object",
  "properties": {
    "vehicleId": {
      "type": "integer",
      "format": "int64"
    },
    "vehicleName": {
      "type": "string"
    },
    "vehicleNumber": {
      "type": "string"
    },
    "brand": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "vehicleType": {
      "type": "string"
    },
    "modelYear": {
      "type": "integer",
      "format": "int32"
    },
    "seatingCapacity": {
      "type": "integer",
      "format": "int32"
    },
    "fuelType": {
      "type": "string"
    },
    "registrationDate": {
      "type": "string",
      "format": "date"
    },
    "ratePerKm": {
      "type": "number"
    },
    "acRatePerKm": {
      "type": "number"
    },
    "location": {
      "type": "string"
    },
    "features": {
      "type": "string"
    },
    "ownerProfileId": {
      "type": "integer",
      "format": "int64"
    },
    "ownerUserId": {
      "type": "integer",
      "format": "int64"
    },
    "ownerFullName": {
      "type": "string"
    },
    "ownerEmail": {
      "type": "string"
    },
    "ownerMobileNumber": {
      "type": "string"
    },
    "submittedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## AdminOwnerDriverDetailResponse
`json
{
  "type": "object",
  "properties": {
    "driverProfileId": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "businessName": {
      "type": "string"
    },
    "licenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "approvalStatus": {
      "type": "string"
    },
    "rejectionReason": {
      "type": "string"
    },
    "documents": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DocumentResponse"
      }
    },
    "approvalHistory": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ApprovalRecordResponse"
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponseAdminOwnerDriverDetailResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AdminOwnerDriverDetailResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponsePageResponsePendingOwnerDriverResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponsePendingOwnerDriverResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## PageResponsePendingOwnerDriverResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/PendingOwnerDriverResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## PendingOwnerDriverResponse
`json
{
  "type": "object",
  "properties": {
    "driverProfileId": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "businessName": {
      "type": "string"
    },
    "licenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "submittedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## AdminDriverDetailResponse
`json
{
  "type": "object",
  "properties": {
    "driverId": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "profilePhotoUrl": {
      "type": "string"
    },
    "licenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "approvalStatus": {
      "type": "string"
    },
    "operationalStatus": {
      "type": "string"
    },
    "rejectionReason": {
      "type": "string"
    },
    "ownerId": {
      "type": "integer",
      "format": "int64"
    },
    "ownerName": {
      "type": "string"
    },
    "ownerEmail": {
      "type": "string"
    },
    "documents": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DocumentResponse"
      }
    },
    "approvalHistory": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ApprovalRecordResponse"
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponseAdminDriverDetailResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/AdminDriverDetailResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponsePageResponsePendingDriverResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponsePendingDriverResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## PageResponsePendingDriverResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/PendingDriverResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## PendingDriverResponse
`json
{
  "type": "object",
  "properties": {
    "driverId": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "licenseNumber": {
      "type": "string"
    },
    "licenseExpiryDate": {
      "type": "string",
      "format": "date"
    },
    "ownerId": {
      "type": "integer",
      "format": "int64"
    },
    "ownerName": {
      "type": "string"
    },
    "ownerEmail": {
      "type": "string"
    },
    "submittedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## ApiResponsePageResponseDeletedAccountResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "$ref": "#/components/schemas/PageResponseDeletedAccountResponse"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## DeletedAccountResponse
`json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "fullName": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "mobileNumber": {
      "type": "string"
    },
    "accountOrigin": {
      "type": "string"
    },
    "roles": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "deleteReason": {
      "type": "string"
    },
    "deletedByName": {
      "type": "string"
    },
    "deletedAt": {
      "type": "string",
      "format": "date-time"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## PageResponseDeletedAccountResponse
`json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DeletedAccountResponse"
      }
    },
    "pageNumber": {
      "type": "integer",
      "format": "int32"
    },
    "pageSize": {
      "type": "integer",
      "format": "int32"
    },
    "totalElements": {
      "type": "integer",
      "format": "int64"
    },
    "totalPages": {
      "type": "integer",
      "format": "int32"
    },
    "isFirst": {
      "type": "boolean"
    },
    "isLast": {
      "type": "boolean"
    },
    "isEmpty": {
      "type": "boolean"
    }
  }
}
`

## ApiResponseMapStringString
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "object",
      "additionalProperties": {
        "type": "string"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## ApiResponseListNotificationResponse
`json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/NotificationResponse"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "statusCode": {
      "type": "integer",
      "format": "int32"
    }
  }
}
`

## NotificationResponse
`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "userId": {
      "type": "integer",
      "format": "int64"
    },
    "title": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "APPROVAL",
        "EMAIL",
        "SYSTEM",
        "SMS",
        "SUBSCRIPTION_EXPIRING",
        "DRIVER_ADDED",
        "OWNER_DRIVER_APPLICATION",
        "VEHICLE_SUBMITTED",
        "CUSTOMER_REGISTERED",
        "SUBSCRIPTION_ACTIVATED",
        "OWNER_REGISTERED"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "SENT",
        "FAILED",
        "UNREAD",
        "READ"
      ]
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
`

## SoftDeleteRequest
`json
{
  "type": "object",
  "properties": {
    "reason": {
      "type": "string",
      "maxLength": 2000,
      "minLength": 0
    }
  }
}
`

