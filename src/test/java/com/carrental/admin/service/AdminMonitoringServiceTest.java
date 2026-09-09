package com.carrental.admin.service;

import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.VehicleMonitoringResponse;
import com.carrental.auth.entity.User;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminMonitoringServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private com.carrental.admin.service.impl.AdminMonitoringServiceImpl adminMonitoringService;

    @Test
    @DisplayName("getVehicleMonitoring - returns mapped vehicle monitoring page")
    void testGetVehicleMonitoring() {
        Pageable pageable = PageRequest.of(0, 10);
        User owner = User.builder().id(5L).firstName("Jane").lastName("Doe").email("jane@test.com").build();
        Vehicle vehicle = Vehicle.builder()
                .id(1L)
                .brand("Tesla")
                .model("Model 3")
                .vehicleType(VehicleType.SEDAN)
                .licensePlate("TESLA-01")
                .owner(owner)
                .status(VehicleStatus.AVAILABLE)
                .build();

        Page<Vehicle> page = new PageImpl<>(List.of(vehicle), pageable, 1);
        when(vehicleRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<VehicleMonitoringResponse> response = adminMonitoringService.getVehicleMonitoring(
                "Tesla", "ACTIVE", VehicleStatus.AVAILABLE, pageable
        );

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        VehicleMonitoringResponse v = response.content().get(0);
        assertThat(v.vehicleId()).isEqualTo(1L);
        assertThat(v.brand()).isEqualTo("Tesla");
        assertThat(v.ownerName()).isEqualTo("Jane Doe");
        assertThat(v.operationalStatus()).isEqualTo("ACTIVE");
    }
}

