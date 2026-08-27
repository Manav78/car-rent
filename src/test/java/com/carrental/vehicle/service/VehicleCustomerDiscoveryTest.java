package com.carrental.vehicle.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.vehicle.dto.VehicleResponse;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleCustomerDiscoveryTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private User owner;
    private Vehicle car1;
    private Vehicle car2;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Owner")
                .email("owner@example.com")
                .role(Role.ROLE_OWNER)
                .build();

        car1 = Vehicle.builder()
                .id(101L)
                .owner(owner)
                .brand("Honda")
                .model("Civic")
                .year(2022)
                .licensePlate("HND-101")
                .pricePerKm(12)
                .seatingCapacity(5)
                .vehicleType(VehicleType.SEDAN)
                .fuelType(FuelType.PETROL)
                .status(VehicleStatus.AVAILABLE)
                .location("San Francisco, CA")
                .imageUrls(List.of("http://example.com/honda.jpg"))
                .description("Comfortable sedan")
                .createdAt(LocalDateTime.now())
                .build();

        car2 = Vehicle.builder()
                .id(102L)
                .owner(owner)
                .brand("Toyota")
                .model("Highlander")
                .year(2023)
                .licensePlate("TYT-102")
                .pricePerKm(20)
                .seatingCapacity(7)
                .vehicleType(VehicleType.SUV)
                .fuelType(FuelType.HYBRID)
                .status(VehicleStatus.AVAILABLE)
                .location("San Francisco, CA")
                .imageUrls(List.of("http://example.com/suv.jpg"))
                .description("Spacious SUV")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return available vehicles matching city filter")
    void testSearchByCity() {
        when(vehicleRepository.searchAvailableVehicles(eq("San Francisco"), isNull(), isNull()))
                .thenReturn(List.of(car1, car2));

        List<VehicleResponse> results = vehicleService.getAllAvailableVehicles("San Francisco", null, null);

        assertEquals(2, results.size());
        assertEquals("Honda", results.get(0).getBrand());
        assertEquals("Toyota", results.get(1).getBrand());
    }

    @Test
    @DisplayName("Should return available vehicles matching vehicleType enum")
    void testSearchByVehicleType() {
        when(vehicleRepository.searchAvailableVehicles(isNull(), eq(VehicleType.SUV), isNull()))
                .thenReturn(List.of(car2));

        List<VehicleResponse> results = vehicleService.getAllAvailableVehicles(null, VehicleType.SUV, null);

        assertEquals(1, results.size());
        assertEquals(VehicleType.SUV, results.get(0).getVehicleType());
        assertEquals(7, results.get(0).getSeatingCapacity());
    }

    @Test
    @DisplayName("Should return available vehicles where seating capacity >= requested")
    void testSearchBySeatingCapacity() {
        when(vehicleRepository.searchAvailableVehicles(isNull(), isNull(), eq(6)))
                .thenReturn(List.of(car2));

        List<VehicleResponse> results = vehicleService.getAllAvailableVehicles(null, null, 6);

        assertEquals(1, results.size());
        assertEquals("Toyota", results.get(0).getBrand());
        assertEquals(7, results.get(0).getSeatingCapacity());
    }

    @Test
    @DisplayName("Should return available vehicles matching combined customer filters")
    void testSearchCombinedFilters() {
        when(vehicleRepository.searchAvailableVehicles(eq("San Francisco"), eq(VehicleType.SEDAN), eq(4)))
                .thenReturn(List.of(car1));

        List<VehicleResponse> results = vehicleService.getAllAvailableVehicles("San Francisco", VehicleType.SEDAN, 4);

        assertEquals(1, results.size());
        assertEquals("Honda", results.get(0).getBrand());
        assertEquals(VehicleType.SEDAN, results.get(0).getVehicleType());
        assertEquals(5, results.get(0).getSeatingCapacity());
    }
}
