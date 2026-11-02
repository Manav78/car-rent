# OpenAPI Endpoints by Tag

## Admin
- **PATCH** /api/admin/vehicles/{id}/status  (Params: id* (path), status* (query))
- **PATCH** /api/v1/admin/vehicles/{id}/status  (Params: id* (path), status* (query))
- **PATCH** /api/v1/admin/users/{id}/status  (Params: id* (path))
- **PATCH** /api/admin/users/{id}/status  (Params: id* (path))
- **PATCH** /api/v1/admin/owners/{id}/status  (Params: id* (path), status* (query))
- **PATCH** /api/admin/owners/{id}/status  (Params: id* (path), status* (query))
- **PATCH** /api/admin/drivers/{id}/status  (Params: id* (path), status* (query))
- **PATCH** /api/v1/admin/drivers/{id}/status  (Params: id* (path), status* (query))
- **GET** /api/admin/users  (Params: )
- **GET** /api/v1/admin/users  (Params: )
- **GET** /api/v1/admin/stats  (Params: )
- **GET** /api/admin/stats  (Params: )
- **GET** /api/admin/owners  (Params: pageable* (query))
- **GET** /api/v1/admin/owners  (Params: pageable* (query))
- **GET** /api/v1/admin/me  (Params: )
- **GET** /api/admin/me  (Params: )
- **GET** /api/v1/admin/drivers  (Params: pageable* (query))
- **GET** /api/admin/drivers  (Params: pageable* (query))
- **GET** /api/admin/dashboard  (Params: )
- **GET** /api/v1/admin/dashboard  (Params: )
- **DELETE** /api/v1/admin/users/{id}  (Params: id* (path))
- **DELETE** /api/admin/users/{id}  (Params: id* (path))

## Admin Accounts
- **PATCH** /api/v1/admin/accounts/{userId}/restore  (Params: userId* (path))
- **PATCH** /api/admin/accounts/{userId}/restore  (Params: userId* (path))
- **GET** /api/v1/admin/accounts/deleted  (Params: search (query), pageable* (query))
- **GET** /api/admin/accounts/deleted  (Params: search (query), pageable* (query))
- **DELETE** /api/admin/accounts/{userId}/permanent  (Params: userId* (path))
- **DELETE** /api/v1/admin/accounts/{userId}/permanent  (Params: userId* (path))
- **DELETE** /api/v1/admin/accounts/{userId}  (Params: userId* (path))
- **DELETE** /api/admin/accounts/{userId}  (Params: userId* (path))

## Admin Approvals
- **GET** /api/v1/admin/approvals/vehicles/{vehicleId}  (Params: vehicleId* (path))
- **PATCH** /api/v1/admin/approvals/vehicles/{vehicleId}  (Params: vehicleId* (path))
- **GET** /api/admin/approvals/vehicles/{vehicleId}  (Params: vehicleId* (path))
- **PATCH** /api/admin/approvals/vehicles/{vehicleId}  (Params: vehicleId* (path))
- **GET** /api/admin/approvals/owner-drivers/{id}  (Params: id* (path))
- **PATCH** /api/admin/approvals/owner-drivers/{id}  (Params: id* (path))
- **GET** /api/v1/admin/approvals/owner-drivers/{id}  (Params: id* (path))
- **PATCH** /api/v1/admin/approvals/owner-drivers/{id}  (Params: id* (path))
- **GET** /api/admin/approvals/drivers/{driverId}  (Params: driverId* (path))
- **PATCH** /api/admin/approvals/drivers/{driverId}  (Params: driverId* (path))
- **GET** /api/v1/admin/approvals/drivers/{driverId}  (Params: driverId* (path))
- **PATCH** /api/v1/admin/approvals/drivers/{driverId}  (Params: driverId* (path))
- **GET** /api/v1/admin/approvals/vehicles/pending  (Params: pageable* (query))
- **GET** /api/admin/approvals/vehicles/pending  (Params: pageable* (query))
- **GET** /api/admin/approvals/owner-drivers/pending  (Params: pageable* (query))
- **GET** /api/v1/admin/approvals/owner-drivers/pending  (Params: pageable* (query))
- **GET** /api/v1/admin/approvals/drivers/pending  (Params: pageable* (query))
- **GET** /api/admin/approvals/drivers/pending  (Params: pageable* (query))

## Admin Notifications
- **PATCH** /api/v1/admin/notifications/{notificationId}/read  (Params: notificationId* (path))
- **PATCH** /api/admin/notifications/{notificationId}/read  (Params: notificationId* (path))
- **PATCH** /api/v1/admin/notifications/read-all  (Params: )
- **PATCH** /api/admin/notifications/read-all  (Params: )
- **GET** /api/v1/admin/notifications/unread-count  (Params: )
- **GET** /api/admin/notifications/unread-count  (Params: )
- **GET** /api/admin/notifications  (Params: isRead (query), page (query), size (query), sort (query))
- **GET** /api/v1/admin/notifications  (Params: isRead (query), page (query), size (query), sort (query))

## Authentication
- **POST** /api/auth/verify-email  (Params: )
- **POST** /api/auth/reset-password  (Params: )
- **POST** /api/auth/resend-verification-otp  (Params: )
- **POST** /api/auth/resend-verification  (Params: )
- **POST** /api/auth/refresh-token  (Params: )
- **POST** /api/auth/owner/signup  (Params: )
- **POST** /api/auth/signup/owner  (Params: )
- **POST** /api/auth/logout  (Params: )
- **POST** /api/auth/login  (Params: )
- **POST** /api/auth/forgot-password  (Params: )
- **POST** /api/auth/signup/customer  (Params: )
- **POST** /api/auth/customer/signup  (Params: )
- **POST** /api/auth/login/admin  (Params: )
- **POST** /api/auth/admin/login  (Params: )
- **GET** /api/auth/me  (Params: )

## Bookings
- **POST** /api/bookings  (Params: )
- **PATCH** /api/bookings/{id}/status  (Params: id* (path))
- **GET** /api/bookings/{id}  (Params: id* (path))
- **GET** /api/bookings/owner-bookings  (Params: )
- **GET** /api/bookings/my-bookings  (Params: )
- **GET** /api/bookings/driver-trips  (Params: )

## Customer
- **GET** /api/customers/profile  (Params: )
- **PUT** /api/customers/profile  (Params: )
- **DELETE** /api/customers/profile  (Params: )
- **PATCH** /api/customers/profile  (Params: )
- **GET** /api/customers/history  (Params: )
- **GET** /api/customers/dashboard  (Params: )

## Customer Bookings
- **GET** /api/v1/customers/bookings/history  (Params: )
- **GET** /api/customers/bookings/history  (Params: )
- **GET** /api/v1/customers/bookings  (Params: )
- **GET** /api/customers/bookings  (Params: )

## Customer Profile
- **GET** /api/v1/customers/profile  (Params: )
- **PUT** /api/v1/customers/profile  (Params: )
- **DELETE** /api/v1/customers/profile  (Params: )
- **PATCH** /api/v1/customers/profile  (Params: )

## Driver
- **GET** /api/drivers/profile  (Params: )
- **PUT** /api/drivers/profile  (Params: )
- **PATCH** /api/drivers/status  (Params: )
- **GET** /api/drivers/dashboard  (Params: )
- **GET** /api/drivers/available  (Params: )

## Driver Trips
- **PATCH** /api/v1/drivers/trips/{id}/status  (Params: id* (path))
- **PATCH** /api/drivers/trips/{id}/status  (Params: id* (path))
- **GET** /api/v1/drivers/trips  (Params: )
- **GET** /api/drivers/trips  (Params: )

## Notifications
- **GET** /api/notifications  (Params: )

## Owner
- **GET** /api/owners/profile  (Params: )
- **PUT** /api/owners/profile  (Params: )
- **GET** /api/owners/dashboard  (Params: )

## Owner Bookings
- **PUT** /api/owners/bookings/{id}/status  (Params: id* (path))
- **PATCH** /api/owners/bookings/{id}/status  (Params: id* (path))
- **PUT** /api/v1/owners/bookings/{id}/status  (Params: id* (path))
- **PATCH** /api/v1/owners/bookings/{id}/status  (Params: id* (path))
- **POST** /api/owners/bookings/{id}/assign-driver  (Params: id* (path))
- **POST** /api/v1/owners/bookings/{id}/assign-driver  (Params: id* (path))
- **GET** /api/v1/owners/bookings/{id}  (Params: id* (path))
- **GET** /api/owners/bookings/{id}  (Params: id* (path))
- **GET** /api/owners/bookings  (Params: status (query))
- **GET** /api/v1/owners/bookings  (Params: status (query))

## Owner Drivers
- **GET** /api/v1/owners/drivers/available  (Params: )
- **GET** /api/owners/drivers/available  (Params: )

## Owner Profile
- **GET** /api/v1/owners/profile  (Params: )
- **PUT** /api/v1/owners/profile  (Params: )

## Owner Vehicles
- **PUT** /api/owners/vehicles/{id}  (Params: id* (path))
- **DELETE** /api/owners/vehicles/{id}  (Params: id* (path))
- **PUT** /api/v1/owners/vehicles/{id}  (Params: id* (path))
- **DELETE** /api/v1/owners/vehicles/{id}  (Params: id* (path))
- **GET** /api/v1/owners/vehicles  (Params: )
- **POST** /api/v1/owners/vehicles  (Params: )
- **GET** /api/owners/vehicles  (Params: )
- **POST** /api/owners/vehicles  (Params: )

## Vehicles
- **GET** /api/vehicles/{id}  (Params: id* (path))
- **PUT** /api/vehicles/{id}  (Params: id* (path))
- **DELETE** /api/vehicles/{id}  (Params: id* (path))
- **GET** /api/vehicles  (Params: city (query), vehicleType (query), seatingCapacity (query))
- **POST** /api/vehicles  (Params: )
- **GET** /api/vehicles/search  (Params: city (query), vehicleType (query), seatingCapacity (query))
- **GET** /api/vehicles/my-vehicles  (Params: )

