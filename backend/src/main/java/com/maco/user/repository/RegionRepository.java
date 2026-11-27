package com.maco.user.repository;

import com.maco.user.domain.Region;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {

    List<Region> findBySidoOrderBySigungu(String sido);

    List<Region> findAllByOrderBySidoAscSigunguAsc();
}
