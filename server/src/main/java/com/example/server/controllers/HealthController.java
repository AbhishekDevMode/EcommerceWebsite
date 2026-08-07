package com.example.server.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Public endpoint used by the deployment platform's health check. */
@RestController
public class HealthController {

    @RequestMapping(value = {"/", "/health"}, method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
