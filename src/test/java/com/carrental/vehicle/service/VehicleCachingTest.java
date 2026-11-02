package com.carrental.vehicle.service;

import com.carrental.vehicle.dto.response.VehicleResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("Vehicle Caching Integration Tests")
class VehicleCachingTest {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private CacheManager cacheManager;

    @Test
    @DisplayName("Verify ownerVehicles cache is created and populated on getVehiclesByOwner")
    void testOwnerVehiclesCaching() {
        assertNotNull(cacheManager, "CacheManager should be present in context");
        Cache cache = cacheManager.getCache("ownerVehicles");
        assertNotNull(cache, "ownerVehicles cache should exist");

        Long ownerUserId = 2L; // seeded owner in DataInitializer

        // Clear cache prior to test
        cache.evict(ownerUserId);
        assertNull(cache.get(ownerUserId), "Cache should be empty for owner before invocation");

        // 1st call - triggers DB query and populates cache
        List<VehicleResponse> firstCall = vehicleService.getVehiclesByOwner(ownerUserId);
        assertNotNull(firstCall);

        // Verify cache entry exists
        Cache.ValueWrapper cachedWrapper = cache.get(ownerUserId);
        assertNotNull(cachedWrapper, "Cache should now contain an entry for ownerUserId");

        @SuppressWarnings("unchecked")
        List<VehicleResponse> cachedVehicles = (List<VehicleResponse>) cachedWrapper.get();
        assertEquals(firstCall.size(), cachedVehicles.size());

        // 2nd call - fetched directly from cache
        List<VehicleResponse> secondCall = vehicleService.getVehiclesByOwner(ownerUserId);
        assertSame(cachedVehicles, secondCall, "Second call should return the exact cached instance");
    }
}
