package com.example.server.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;

    public JwtResponse(String token, Long id, String name, String email, String role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}
