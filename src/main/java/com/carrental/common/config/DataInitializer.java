package com.carrental.common.config;


import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.repository.CustomerProfileRepository;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.subscription.entity.SubscriptionPlan;
import com.carrental.subscription.repository.SubscriptionPlanRepository;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleImage;
import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmins();
        seedUsersAndProfiles();
        seedSubscriptionPlans();
        seedVehicles();
    }

    private void seedAdmins() {
        if (!userRepository.existsByEmail("admin@carrental.com")) {
            log.info("Seeding default admin accounts into users table...");
            User superAdmin = User.builder()
                    .name("System Super Admin")
                    .email("admin@carrental.com")
                    .mobile("9999999991")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .emailVerified(true)
                    .isActive(true)
                    .build();

            userRepository.save(superAdmin);
            log.info("Default admin account seeded successfully into users table.");
        }

        if (!userRepository.existsByEmail("support.admin@carrental.com")) {
            User supportAdmin = User.builder()
                    .name("Support Admin")
                    .email("support.admin@carrental.com")
                    .mobile("9999999992")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .emailVerified(true)
                    .isActive(true)
                    .build();

            userRepository.save(supportAdmin);
        }
    }

    private void seedUsersAndProfiles() {
        if (userRepository.count() == 0) {
            log.info("Seeding default users and profiles...");
            String defaultPassword = passwordEncoder.encode("Password@123");

            // Customer
            User customer = User.builder()
                    .name("John Doe")
                    .email("customer@carrental.com")
                    .mobile("9876543211")
                    .password(defaultPassword)
                    .role(Role.CUSTOMER)
                    .emailVerified(true)
                    .isActive(true)
                    .build();
            User savedCustomer = userRepository.save(customer);

            CustomerProfile customerProfile = CustomerProfile.builder()
                    .user(savedCustomer)
                    .city("Mumbai")
                    .state("Maharashtra")
                    .pincode("400001")
                    .build();
            customerProfileRepository.save(customerProfile);

            // Owner
            User owner = User.builder()
                    .name("Robert Brown")
                    .email("owner@carrental.com")
                    .mobile("9876543213")
                    .password(defaultPassword)
                    .role(Role.OWNER)
                    .emailVerified(true)
                    .isActive(true)
                    .build();
            User savedOwner = userRepository.save(owner);

            OwnerProfile ownerProfile = OwnerProfile.builder()
                    .user(savedOwner)
                    .status(OwnerStatus.APPROVED)
                    .approvedAt(LocalDateTime.now())
                    .build();
            ownerProfileRepository.save(ownerProfile);

            // Driver (Independent driver)
            User driver = User.builder()
                    .name("Michael Knight")
                    .email("driver@carrental.com")
                    .mobile("9876543215")
                    .password(defaultPassword)
                    .role(Role.DRIVER)
                    .emailVerified(true)
                    .isActive(true)
                    .build();
            User savedDriver = userRepository.save(driver);

            DriverProfile driverProfile = DriverProfile.builder()
                    .user(savedDriver)
                    .addedByOwner(savedOwner)
                    .licenseNumber("DL-MH-2020-0012345")
                    .licenseExpiryDate(LocalDate.now().plusYears(5))
                    .status(DriverStatus.APPROVED)
                    .approvalStatus("APPROVED")
                    .approvedAt(LocalDateTime.now())
                    .willingToDrive(true)
                    .yearsOfExperience(6)
                    .rating(4.9)
                    .totalTrips(45)
                    .build();
            driverProfileRepository.save(driverProfile);

            log.info("Default users and profiles seeded successfully.");
        }
    }

    private void seedSubscriptionPlans() {
        if (subscriptionPlanRepository.count() == 0) {
            log.info("Seeding subscription plans...");
            SubscriptionPlan basic = SubscriptionPlan.builder()
                    .name("Basic Monthly")
                    .durationDays(30)
                    .price(new BigDecimal("999.00"))
                    .maxDrivers(2)
                    .maxVehicles(5)
                    .isActive(true)
                    .build();

            SubscriptionPlan standard = SubscriptionPlan.builder()
                    .name("Standard Quarterly")
                    .durationDays(90)
                    .price(new BigDecimal("2499.00"))
                    .maxDrivers(5)
                    .maxVehicles(15)
                    .isActive(true)
                    .build();

            SubscriptionPlan premium = SubscriptionPlan.builder()
                    .name("Premium Annual")
                    .durationDays(365)
                    .price(new BigDecimal("7999.00"))
                    .maxDrivers(20)
                    .maxVehicles(50)
                    .isActive(true)
                    .build();

            subscriptionPlanRepository.save(basic);
            subscriptionPlanRepository.save(standard);
            subscriptionPlanRepository.save(premium);
            log.info("Subscription plans seeded successfully.");
        }
    }

    private void seedVehicles() {
        if (vehicleRepository.count() == 0) {
            userRepository.findByEmail("owner@carrental.com").ifPresent(owner -> {
                log.info("Seeding sample vehicles...");
                Vehicle innova = Vehicle.builder()
                        .owner(owner)
                        .brand("Toyota")
                        .model("Innova Crysta")
                        .year(2022)
                        .vehicleNumber("MH-01-AB-1234")
                        .vehicleType(VehicleType.SUV)
                        .fuelType(FuelType.DIESEL)
                        .seatingCapacity(7)
                        .hasAc(true)
                        .pricePerKm(18)
                        .status(VehicleStatus.AVAILABLE)
                        .approvalStatus("APPROVED")
                        .approvedAt(LocalDateTime.now())
                        .location("Mumbai Central")
                        .description("Spacious 7-seater luxury SUV with premium comfort.")
                        .build();

                VehicleImage image1 = VehicleImage.builder()
                        .vehicle(innova)
                        .imageType("FRONT")
                        .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800")
                        .build();
                innova.getImages().add(image1);

                Vehicle creta = Vehicle.builder()
                        .owner(owner)
                        .brand("Hyundai")
                        .model("Creta")
                        .year(2023)
                        .vehicleNumber("MH-01-CD-5678")
                        .vehicleType(VehicleType.SUV)
                        .fuelType(FuelType.PETROL)
                        .seatingCapacity(5)
                        .hasAc(true)
                        .pricePerKm(14)
                        .status(VehicleStatus.AVAILABLE)
                        .approvalStatus("APPROVED")
                        .approvedAt(LocalDateTime.now())
                        .location("Bandra, Mumbai")
                        .description("Feature-packed 5-seater modern SUV.")
                        .build();

                VehicleImage image2 = VehicleImage.builder()
                        .vehicle(creta)
                        .imageType("FRONT")
                        .imageUrl("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800")
                        .build();
                creta.getImages().add(image2);

                vehicleRepository.save(innova);
                vehicleRepository.save(creta);
                log.info("Sample vehicles seeded successfully.");
            });
        }
    }
}

