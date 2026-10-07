package com.taskmanager.config;

import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình Spring Security — "người gác cổng" của toàn bộ API.
 *
 * UserDetailsService được inject từ CustomUserDetailsService (@Service riêng)
 * thay vì khai báo @Bean tại đây — tránh Circular Dependency với JwtAuthenticationFilter.
 *
 * Các Bean:
 * - PasswordEncoder (BCrypt)    → Băm và xác minh mật khẩu
 * - AuthenticationProvider      → Kết hợp UserDetailsService + PasswordEncoder
 * - AuthenticationManager       → Thực hiện xác thực, dùng trong AuthService
 * - CorsConfigurationSource     → Cho phép React frontend gọi API từ cổng khác
 * - SecurityFilterChain         → Quy tắc bảo vệ endpoint + gắn JWT filter
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    // Inject từ @Service riêng — phá vòng tròn phụ thuộc
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * BCrypt với strength=10 (mặc định).
     * Strength = số vòng lặp băm (2^10 = 1024 vòng).
     * Đủ chậm để chống brute-force, đủ nhanh để không lag.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Kết hợp CustomUserDetailsService + PasswordEncoder.
     * Spring dùng provider này để xác thực (tìm user → so sánh mật khẩu).
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager — dùng trong AuthService.login() để xác thực.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS — cho phép React (localhost:5173) gọi API sang backend (localhost:8080).
     * Production: thay bằng domain thật.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:80", "http://localhost"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Quy tắc bảo vệ endpoint:
     * - csrf disabled         → Không cần khi dùng JWT (stateless, không dùng cookie/session)
     * - STATELESS             → Không tạo session server-side, mỗi request tự mang token
     * - /api/auth/**          → Mở hoàn toàn (đăng ký, đăng nhập)
     * - /swagger-ui/**        → Mở để nhà tuyển dụng test API
     * - Còn lại               → Bắt buộc có JWT token hợp lệ
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
