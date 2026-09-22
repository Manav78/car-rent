package com.carrental;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.EmailVerificationToken;
import com.carrental.auth.entity.PasswordResetToken;
import com.carrental.auth.entity.RefreshToken;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.EmailVerificationTokenRepository;
import com.carrental.auth.repository.PasswordResetTokenRepository;
import com.carrental.auth.repository.RefreshTokenRepository;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.entity.Trip;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.booking.repository.TripRepository;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.repository.CustomerProfileRepository;
import com.carrental.driver.entity.DriverDocument;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverDocumentRepository;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.repository.NotificationRepository;
import com.carrental.owner.entity.OwnerDriverApplication;
import com.carrental.owner.entity.OwnerDriverUsageHistory;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.owner.repository.OwnerDriverApplicationRepository;
import com.carrental.owner.repository.OwnerDriverUsageHistoryRepository;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.subscription.entity.OwnerSubscription;
import com.carrental.subscription.entity.SubscriptionPlan;
import com.carrental.subscription.repository.OwnerSubscriptionRepository;
import com.carrental.subscription.repository.SubscriptionPlanRepository;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleDocument;
import com.carrental.vehicle.entity.VehicleImage;
import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.repository.VehicleDocumentRepository;
import com.carrental.vehicle.repository.VehicleImageRepository;
import com.carrental.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class V2SchemaEntitiesTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private OwnerProfileRepository ownerProfileRepository;

    @Autowired
    private DriverProfileRepository driverProfileRepository;

    @Autowired
    private DriverDocumentRepository driverDocumentRepository;

    @Autowired
    private OwnerDriverUsageHistoryRepository ownerDriverUsageHistoryRepository;

    @Autowired
    private OwnerDriverApplicationRepository ownerDriverApplicationRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleImageRepository vehicleImageRepository;

    @Autowired
    private VehicleDocumentRepository vehicleDocumentRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private OwnerSubscriptionRepository ownerSubscriptionRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Test
    @DisplayName("Verify User and CustomerProfile with V2 schema fields")
    void testUserAndCustomerProfileV2() {
        User user = User.builder()
                .name("John Doe")
                .email("johndoe@test.com")
                .mobile("9876543210")
                .password("Password@123")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        assertEquals("John Doe", user.getName());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("9876543210", user.getMobile());
        assertTrue(user.getEmailVerified());
        assertTrue(user.getIsActive());

        CustomerProfile profile = CustomerProfile.builder()
                .user(user)
                .city("Pune")
                .state("Maharashtra")
                .pincode("411001")
                .build();
        profile = customerProfileRepository.save(profile);

        assertNotNull(profile.getId());
        assertEquals("Maharashtra", profile.getState());
        assertEquals("411001", profile.getPincode());
        assertEquals("411001", profile.getPostalCode());
    }

    @Test
    @DisplayName("Verify user_roles ElementCollection with Role")
    void testUserRolesElementCollectionV2() {
        User multiRoleUser = User.builder()
                .name("Multi Role User")
                .email("multirole@test.com")
                .mobile("9111222333")
                .password("Password@123")
                .emailVerified(true)
                .isActive(true)
                .build();
        multiRoleUser.getRoles().add(Role.OWNER);
        multiRoleUser.getRoles().add(Role.DRIVER);

        multiRoleUser = userRepository.save(multiRoleUser);

        assertNotNull(multiRoleUser.getId());
        assertEquals(2, multiRoleUser.getRoles().size());
        assertTrue(multiRoleUser.getRoles().contains(Role.OWNER));
        assertTrue(multiRoleUser.getRoles().contains(Role.DRIVER));

        List<User> drivers = userRepository.findByRole(Role.DRIVER);
        assertTrue(drivers.stream().anyMatch(u -> u.getEmail().equals("multirole@test.com")));
    }

    @Test
    @DisplayName("Verify OwnerProfile and Subscription entities with V2 schema")
    void testOwnerAndSubscriptionsV2() {
        User ownerUser = User.builder()
                .name("Owner Smith")
                .email("owner.smith@test.com")
                .mobile("9123456780")
                .password("Password@123")
                .role(Role.OWNER)
                .emailVerified(true)
                .isActive(true)
                .build();
        ownerUser = userRepository.save(ownerUser);

        OwnerProfile ownerProfile = OwnerProfile.builder()
                .user(ownerUser)
                .approvalStatus(OwnerStatus.APPROVED)
                .approvedAt(LocalDateTime.now())
                .build();
        ownerProfile = ownerProfileRepository.save(ownerProfile);

        assertNotNull(ownerProfile.getId());
        assertEquals(OwnerStatus.APPROVED, ownerProfile.getApprovalStatus());

        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name("Gold Plan")
                .durationDays(30)
                .price(new BigDecimal("1999.00"))
                .maxDrivers(10)
                .maxVehicles(15)
                .isActive(true)
                .build();
        plan = subscriptionPlanRepository.save(plan);

        assertNotNull(plan.getId());
        assertEquals("Gold Plan", plan.getName());

        OwnerSubscription subscription = OwnerSubscription.builder()
                .owner(ownerUser)
                .plan(plan)
                .startAt(LocalDateTime.now())
                .endAt(LocalDateTime.now().plusDays(30))
                .status("ACTIVE")
                .build();
        subscription = ownerSubscriptionRepository.save(subscription);

        assertNotNull(subscription.getId());
        assertEquals("ACTIVE", subscription.getStatus());
        assertEquals(1, ownerSubscriptionRepository.findByOwnerId(ownerUser.getId()).size());
    }

    @Test
    @DisplayName("Verify DriverProfile, DriverDocument, and OwnerDriverUsageHistory V2")
    void testDriverAndUsageHistoryV2() {
        User ownerUser = User.builder()
                .name("Fleet Owner")
                .email("fleet@test.com")
                .mobile("9988776655")
                .password("Password@123")
                .role(Role.OWNER)
                .build();
        ownerUser = userRepository.save(ownerUser);

        User driverUser = User.builder()
                .name("Fleet Driver")
                .email("driver1@test.com")
                .mobile("9876501234")
                .password("Password@123")
                .role(Role.DRIVER)
                .build();
        driverUser = userRepository.save(driverUser);

        DriverProfile driverProfile = DriverProfile.builder()
                .user(driverUser)
                .addedByOwner(ownerUser)
                .licenseNumber("DL-1234567890")
                .licenseExpiryDate(LocalDate.now().plusYears(5))
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .approvedAt(LocalDateTime.now())
                .build();
        driverProfile = driverProfileRepository.save(driverProfile);

        assertNotNull(driverProfile.getId());
        assertEquals(ownerUser.getId(), driverProfile.getAddedByOwner().getId());
        assertEquals("DL-1234567890", driverProfile.getLicenseNumber());

        DriverDocument document = DriverDocument.builder()
                .driver(driverProfile)
                .documentType("DRIVING_LICENSE")
                .documentUrl("https://storage.example.com/dl.pdf")
                .verifiedAt(LocalDateTime.now())
                .build();
        document = driverDocumentRepository.save(document);

        assertNotNull(document.getId());
        assertEquals(1, driverDocumentRepository.findByDriverId(driverProfile.getId()).size());

        OwnerDriverUsageHistory usageHistory = OwnerDriverUsageHistory.builder()
                .owner(ownerUser)
                .driver(driverProfile)
                .firstUsedAt(LocalDateTime.now().minusDays(10))
                .lastUsedAt(LocalDateTime.now())
                .build();
        usageHistory = ownerDriverUsageHistoryRepository.save(usageHistory);

        assertNotNull(usageHistory.getId());
        assertEquals(1, ownerDriverUsageHistoryRepository.findByOwnerId(ownerUser.getId()).size());

        OwnerDriverApplication application = OwnerDriverApplication.builder()
                .owner(ownerUser)
                .licenseNumber("DL-9999999999")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .status("APPROVED")
                .approvedAt(LocalDateTime.now())
                .build();
        application = ownerDriverApplicationRepository.save(application);

        assertNotNull(application.getId());
        assertEquals(1, ownerDriverApplicationRepository.findByOwnerId(ownerUser.getId()).size());
    }

    @Test
    @DisplayName("Verify Vehicle, VehicleImages, and VehicleDocuments V2")
    void testVehicleAndDocumentsV2() {
        User owner = User.builder()
                .name("Vehicle Owner")
                .email("vowner@test.com")
                .mobile("9112233445")
                .password("Password@123")
                .role(Role.OWNER)
                .build();
        owner = userRepository.save(owner);

        OwnerProfile ownerProfile = OwnerProfile.builder()
                .user(owner)
                .status(OwnerStatus.APPROVED)
                .build();
        ownerProfile = ownerProfileRepository.save(ownerProfile);

        Vehicle vehicle = Vehicle.builder()
                .owner(ownerProfile)
                .brand("Toyota")
                .model("Camry")
                .year(2024)
                .vehicleNumber("MH12XY9999")
                .vehicleType(VehicleType.SEDAN)
                .fuelType(FuelType.PETROL)
                .seatingCapacity(5)
                .hasAc(true)
                .pricePerKm(15)
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .location("Mumbai")
                .build();
        vehicle = vehicleRepository.save(vehicle);

        assertNotNull(vehicle.getId());
        assertEquals("MH12XY9999", vehicle.getVehicleNumber());
        assertEquals("MH12XY9999", vehicle.getLicensePlate());
        assertTrue(vehicle.getHasAc());
        assertEquals(15, vehicle.getPricePerKm());

        VehicleImage image = VehicleImage.builder()
                .vehicle(vehicle)
                .imageType("FRONT")
                .imageUrl("https://storage.example.com/camry_front.jpg")
                .build();
        image = vehicleImageRepository.save(image);

        assertNotNull(image.getId());
        assertEquals(1, vehicleImageRepository.findByVehicleId(vehicle.getId()).size());

        VehicleDocument doc = VehicleDocument.builder()
                .vehicle(vehicle)
                .documentType("INSURANCE")
                .documentUrl("https://storage.example.com/camry_insurance.pdf")
                .issueDate(LocalDate.now().minusMonths(1))
                .expiryDate(LocalDate.now().plusMonths(11))
                .verificationStatus("VERIFIED")
                .verifiedAt(LocalDateTime.now())
                .build();
        doc = vehicleDocumentRepository.save(doc);

        assertNotNull(doc.getId());
        assertEquals(1, vehicleDocumentRepository.findByVehicleId(vehicle.getId()).size());
    }

    @Test
    @DisplayName("Verify Booking and Trip V2")
    void testBookingAndTripV2() {
        User customer = User.builder()
                .name("Booking Customer")
                .email("cust@test.com")
                .mobile("9776655443")
                .password("Password@123")
                .role(Role.CUSTOMER)
                .build();
        customer = userRepository.save(customer);

        CustomerProfile customerProfile = CustomerProfile.builder()
                .user(customer)
                .build();
        customerProfile = customerProfileRepository.save(customerProfile);

        User owner = User.builder()
                .name("Car Host")
                .email("host@test.com")
                .mobile("9665544332")
                .password("Password@123")
                .role(Role.OWNER)
                .build();
        owner = userRepository.save(owner);

        OwnerProfile ownerProfile = OwnerProfile.builder()
                .user(owner)
                .status(OwnerStatus.APPROVED)
                .build();
        ownerProfile = ownerProfileRepository.save(ownerProfile);

        Vehicle vehicle = Vehicle.builder()
                .owner(ownerProfile)
                .brand("Hyundai")
                .model("Creta")
                .year(2023)
                .vehicleNumber("MH14AB7777")
                .vehicleType(VehicleType.SUV)
                .fuelType(FuelType.DIESEL)
                .seatingCapacity(5)
                .hasAc(true)
                .pricePerKm(18)
                .status(VehicleStatus.AVAILABLE)
                .build();
        vehicle = vehicleRepository.save(vehicle);

        Booking booking = Booking.builder()
                .customer(customerProfile)
                .vehicle(vehicle)
                .customerPhoneNumber("9776655443")
                .tripType(TripType.LOCAL)
                .passengerCount(3)
                .pickupLocation("Airport Terminal 2")
                .dropoffLocation("City Center")
                .startDateTime(LocalDateTime.now().plusDays(1))
                .endDateTime(LocalDateTime.now().plusDays(2))
                .status(BookingStatus.CONFIRMED)
                .build();
        booking = bookingRepository.save(booking);

        assertNotNull(booking.getId());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());

        Trip trip = Trip.builder()
                .booking(booking)
                .startedAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now().plusHours(2))
                .actualStartLocation("Airport Terminal 2")
                .actualEndLocation("City Center")
                .status("COMPLETED")
                .build();
        trip = tripRepository.save(trip);

        assertNotNull(trip.getTripId());
        Optional<Trip> foundTrip = tripRepository.findByBookingId(booking.getId());
        assertTrue(foundTrip.isPresent());
        assertEquals("COMPLETED", foundTrip.get().getStatus());
    }

    @Test
    @DisplayName("Verify Notification and Token Entities V2")
    void testNotificationAndTokensV2() {
        User user = User.builder()
                .name("Notify User")
                .email("notify@test.com")
                .mobile("9554433221")
                .password("Password@123")
                .role(Role.CUSTOMER)
                .build();
        user = userRepository.save(user);

        Notification notification = Notification.builder()
                .recipient(user)
                .title("Trip Started")
                .message("Your driver is on the way")
                .notificationType(NotificationType.SYSTEM)
                .referenceType("BOOKING")
                .referenceId(101L)
                .isRead(false)
                .build();
        notification = notificationRepository.save(notification);

        assertNotNull(notification.getId());
        assertFalse(notification.getIsRead());
        assertEquals(NotificationType.SYSTEM, notification.getNotificationType());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token("v2-refresh-token-uuid")
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();
        refreshToken = refreshTokenRepository.save(refreshToken);

        assertNotNull(refreshToken.getId());
        assertFalse(refreshToken.isExpired());
        assertFalse(refreshToken.isRevoked());

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token("v2-reset-token-uuid")
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();
        resetToken = passwordResetTokenRepository.save(resetToken);

        assertNotNull(resetToken.getId());
        assertFalse(resetToken.isExpired());
        assertFalse(resetToken.isUsed());

        EmailVerificationToken emailToken = EmailVerificationToken.builder()
                .user(user)
                .token("v2-email-token-uuid")
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailToken = emailVerificationTokenRepository.save(emailToken);

        assertNotNull(emailToken.getId());
        assertFalse(emailToken.isExpired());
    }
}

