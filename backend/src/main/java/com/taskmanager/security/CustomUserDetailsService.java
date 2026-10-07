package com.taskmanager.security;

import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Implement UserDetailsService — dạy Spring Security cách load user từ DB.
 *
 * Tại sao tách ra file riêng thay vì để trong SecurityConfig?
 * → Nếu để trong SecurityConfig, sẽ xảy ra Circular Dependency:
 *   SecurityConfig cần JwtAuthenticationFilter
 *   JwtAuthenticationFilter cần UserDetailsService
 *   UserDetailsService (bean trong SecurityConfig) cần SecurityConfig tạo trước
 *   → Spring không biết tạo cái nào trước → lỗi!
 *
 * Tách ra @Service riêng → Spring quản lý độc lập, không còn vòng tròn.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPasswordHash())
                        .roles("USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + username));
    }
}
