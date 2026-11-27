package com.maco.common.time;

/**
 * 시연 계정의 가상 날짜(오늘 + n일)를 알려 준다. user 패키지가 구현한다.
 * common이 user를 직접 부르지 않게(순환 의존 방지) 인터페이스로 둔다.
 */
public interface DayOffsetProvider {

    int dayOffset(Long userId);
}
