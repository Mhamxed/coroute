package com.example.backend.controller;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.model.Trajet;
import com.example.backend.service.TrajetService;


@RestController
@RequestMapping("/api/trips")
public class TrajetController {

    private final TrajetService service;

    public TrajetController(TrajetService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Integer> create(@RequestBody Trajet t) {
        int id = service.create(t);
        return ResponseEntity.ok(id);
    }

    @GetMapping("/{id}")
    public Trajet get(@PathVariable int id) {
        return service.get(id);
    }

    @GetMapping("/search")
    public List<Trajet> search(
        @RequestParam String origin,
        @RequestParam String destination
    ) {
        return service.search(origin, destination);
    }

    @GetMapping("/driver/{driverId}")
    public List<Trajet> driverTrips(@PathVariable int driverId) {
        return service.driverTrips(driverId);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable int id, @RequestBody Trajet t) {
        t.setId(id);
        service.update(t);
    }

    @DeleteMapping("/{id}")
    public void cancel(@PathVariable int id) {
        service.cancel(id);
    }
}
