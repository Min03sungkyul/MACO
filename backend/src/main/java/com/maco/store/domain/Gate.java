package com.maco.store.domain;

import lombok.Getter;

/** 3관문: 찾게 → 믿게 → 알리게 (기획서 3장 원칙 ①) */
@Getter
public enum Gate {
    FIND("찾게"), TRUST("믿게"), NOTIFY("알리게");

    private final String label;

    Gate(String label) {
        this.label = label;
    }
}
