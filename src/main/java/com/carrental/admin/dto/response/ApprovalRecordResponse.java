package com.carrental.admin.dto.response;

import java.time.LocalDateTime;

public record ApprovalRecordResponse(
        String decision,
        String reason,
        String decidedBy,
        LocalDateTime decidedAt
) {}


