package com.carrental.admin.dto.request;

import com.carrental.admin.enums.ApprovalDecision;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApprovalDecisionRequest(
        @NotNull(message = "Decision is Required")
        ApprovalDecision decision,

        @Size(max = 2000, message = "Reason does not exceed 2000 characters")
        String reason
) {}


