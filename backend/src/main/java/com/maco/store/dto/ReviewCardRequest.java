package com.maco.store.dto;

import jakarta.validation.constraints.Size;

public record ReviewCardRequest(@Size(max = 100) String message, @Size(max = 500) String qrTargetUrl) {
}
