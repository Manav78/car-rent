package com.carrental.vehicle.service;

import com.carrental.vehicle.service.impl.VehicleServiceImpl;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.vehicle.dto.request.VehicleRequest;
import com.carrental.vehicle.dto.response.VehicleResponse;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleService Unit Tests")
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private User sampleOwner;
    private Vehicle sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleOwner = User.builder()
                .id(20L)
                .firstName("Bob")
                .lastName("Owner")
                .email("bob@owner.com")
                .role(Role.ROLE_OWNER)
                .build();

        sampleVehicle = Vehicle.builder()
                .id(100L)
                .owner(sampleOwner)
                .brand("Honda")
                .model("City")
                .year(2023)
                .licensePlate("MH12AB1234")
                .pricePerKm(15)
                .seatingCapacity(5)
                .vehicleType(VehicleType.SEDAN)
                .fuelType(FuelType.PETROL)
                .status(VehicleStatus.AVAILABLE)
                .location("Pune")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create vehicle successfully")
    void testCreateVehicleSuccess() {
        VehicleRequest request = new VehicleRequest();
        request.setBrand("Honda");
        request.setModel("City");
        request.setYear(2023);
        request.setLicensePlate("MH12AB1234");
        request.setPricePerKm(15);
        request.setSeatingCapacity(5);
        request.setVehicleType(VehicleType.SEDAN);
        request.setFuelType(FuelType.PETROL);
        request.setLocation("Pune");

        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleOwner));
        when(vehicleRepository.existsByLicensePlate("MH12AB1234")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(sampleVehicle);

        VehicleResponse response = vehicleService.createVehicle(20L, request);

        assertNotNull(response);
        assertEquals("Honda", response.getBrand());
        assertEquals("City", response.getModel());
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should throw exception on duplicate license plate")
    void testCreateDuplicatePlate() {
        VehicleRequest request = new VehicleRequest();
        request.setLicensePlate("MH12AB1234");

        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleOwner));
        when(vehicleRepository.existsByLicensePlate("MH12AB1234")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> vehicleService.createVehicle(20L, request));
    }

    @Test
    @DisplayName("Should get vehicle by ID")
    void testGetVehicleById() {
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(sampleVehicle));

        VehicleResponse response = vehicleService.getVehicleById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Honda", response.getBrand());
    }

    @Test
    @DisplayName("Should throw exception when vehicle not found")
    void testGetVehicleNotFound() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.getVehicleById(999L));
    }

    @Test
    @DisplayName("Should get vehicles by owner")
    void testGetVehiclesByOwner() {
        when(vehicleRepository.findByOwnerId(20L)).thenReturn(List.of(sampleVehicle));

        List<VehicleResponse> list = vehicleService.getVehiclesByOwner(20L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("MH12AB1234", list.get(0).getLicensePlate());
    }
}

