package com.carrental.admin.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNotificationPublisher {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notifyOwnerRegistered(Long ownerUserId, String ownerName) {
        publish(
                "OWNER_REGISTERED",
                "New Owner Registered",
                String.format("Owner '%s' has registered on the platform.", ownerName),
                "USER",
                ownerUserId
        );
    }

    @Transactional
    public void notifyCustomerRegistered(Long customerUserId, String customerName) {
        publish(
                "CUSTOMER_REGISTERED",
                "New Customer Registered",
                String.format("Customer '%s' has registered on the platform.", customerName),
                "USER",
                customerUserId
        );
    }

    @Transactional
    public void notifyOwnerDriverApplication(Long driverProfileId, String ownerName) {
        publish(
                "OWNER_DRIVER_APPLICATION_SUBMITTED",
                "Owner Applied for Driver Role",
                String.format("Owner '%s' submitted license for driver verification.", ownerName),
                "DRIVER",
                driverProfileId
        );
    }

    @Transactional
    public void notifyDriverAdded(Long driverProfileId, String driverName, String ownerName) {
        publish(
                "DRIVER_REGISTERED",
                "New Driver Pending Approval",
                String.format("Owner '%s' added driver '%s'. Awaiting approval.", ownerName, driverName),
                "DRIVER",
                driverProfileId
        );
    }

    @Transactional
    public void notifyVehicleSubmitted(Long vehicleId, String vehicleNumber, String ownerName) {
        publish(
                "VEHICLE_SUBMITTED",
                "New Vehicle Pending Approval",
                String.format("Owner '%s' submitted vehicle '%s' for approval.", ownerName, vehicleNumber),
                "VEHICLE",
                vehicleId
        );
    }

    @Transactional
    public void notifySubscriptionActivated(Long subscriptionId, String ownerName, String planName) {
        publish(
                "SUBSCRIPTION_ACTIVATED",
                "Subscription Activated",
                String.format("Owner '%s' activated the '%s' plan.", ownerName, planName),
                "SUBSCRIPTION",
                subscriptionId
        );
    }

    @Transactional
    public void notifySubscriptionExpiring(
            Long subscriptionId,
            String ownerName,
            String planName,
            long daysRemaining
    ) {
        publish(
                "SUBSCRIPTION_EXPIRING",
                "Subscription Expiring Soon",
                String.format("Owner '%s' subscription '%s' expires in %d day(s).", ownerName, planName, daysRemaining),
                "SUBSCRIPTION",
                subscriptionId
        );
    }

    private void publish(
            String type,
            String title,
            String message,
            String referenceType,
            Long referenceId
    ) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        if (admins.isEmpty()) {
            admins = userRepository.findByRole(Role.ROLE_ADMIN);
        }

        if (admins.isEmpty()) {
            log.warn("No active ADMIN found. Notification '{}' skipped.", type);
            return;
        }

        List<Notification> notifications = admins.stream()
                .map(admin -> Notification.builder()
                        .recipient(admin)
                        .type(NotificationType.SYSTEM)
                        .title(title)
                        .message(message)
                        .status(NotificationStatus.UNREAD)
                        .referenceType(referenceType)
                        .referenceId(referenceId)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
    }
}

