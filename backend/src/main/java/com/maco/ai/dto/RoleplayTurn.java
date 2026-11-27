package com.maco.ai.dto;

/** @param role "customer" 또는 "owner" */
public record RoleplayTurn(String role, String text) {
}
