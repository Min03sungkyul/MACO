package com.maco.user.service;

import com.maco.common.time.DayOffsetProvider;
import com.maco.user.domain.User;
import com.maco.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** AppClock에 시연 가상 날짜(users.demo_day_offset)를 알려 준다. */
@Component
@RequiredArgsConstructor
public class DemoDayOffsetProvider implements DayOffsetProvider {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public int dayOffset(Long userId) {
        return userRepository.findById(userId).map(User::getDemoDayOffset).orElse(0);
    }
}
