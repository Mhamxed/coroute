package com.example.backend.scheduler;

import com.example.backend.repository.TrajetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TripExpiryScheduler {

    private final TrajetRepository trajetRepository;

    @Scheduled(fixedRate = 300000)
    public void completePassedTrips() {
        log.info("Scheduler fired");
        int count = trajetRepository.completePassedTrips();
        if (count > 0) {
            log.info("Marked {} trip(s) as COMPLETED", count);
        }
    }
}