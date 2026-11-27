package com.maco.content.dto;

/** 보기 하나. image가 "photo:s=latte;light=dark"면 화면의 PhotoMock이 그림으로 그린다. */
public record ChoiceDto(String key, String text, String image) {
}
