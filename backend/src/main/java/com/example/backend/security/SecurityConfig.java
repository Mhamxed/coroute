package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var config = new org.springframework.web.cors.CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:5173"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth


                        .requestMatchers("/api/auth/**").permitAll()


                        .requestMatchers("/api/admins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/drivers/{id}/verify").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/passengers/{id}/verify").hasRole("ADMIN")


                        .requestMatchers(HttpMethod.POST,   "/api/trips").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.PUT,    "/api/trips/{id}").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.DELETE, "/api/trips/{id}").hasRole("DRIVER")


                        .requestMatchers(HttpMethod.GET, "/api/trips/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/drivers/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/passengers/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/**").authenticated()
                        .requestMatchers("/api/users/**").authenticated()


                        .requestMatchers(HttpMethod.POST,   "/api/vehicles/**").hasAnyRole("DRIVER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/vehicles/**").hasAnyRole("DRIVER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/**").hasRole("ADMIN")


                        .anyRequest().denyAll()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}