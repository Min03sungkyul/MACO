package com.maco.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoreRegisterRequest(@NotBlank @Size(max = 100) String name, String category, String address,
                                   String roadAddress, String mapx, String mapy, String link) {
}
