package com.taskmanager.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter chạy MỖI REQUEST một lần để xác thực JWT token.
 *
 * Luồng xử lý của filter này:
 * 1. Đọc header "Authorization" từ request
 * 2. Nếu có "Bearer <token>" → lấy phần token ra
 * 3. Validate token → nếu hợp lệ → đọc username từ token
 * 4. Load UserDetails từ DB theo username
 * 5. Đặt Authentication vào SecurityContext → Spring biết "ai đang gửi request này"
 * 6. Nếu thiếu token hoặc token sai → không set Authentication → SecurityConfig sẽ chặn
 *
 * OncePerRequestFilter → đảm bảo filter chỉ chạy 1 lần mỗi request (không bị gọi lại).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Bước 1 & 2: Lấy token từ header "Authorization: Bearer <token>"
        String token = extractTokenFromRequest(request);

        // Bước 3: Validate token và chưa có authentication trong context
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Bước 3: Lấy username từ token
            String username = jwtUtil.extractUsername(token);

            // Bước 4: Load thông tin user từ DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Bước 5: Tạo Authentication object và đặt vào SecurityContext
            // UsernamePasswordAuthenticationToken(principal, credentials, authorities)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Bước 6: Tiếp tục chuỗi filter (request đi tiếp đến Controller)
        filterChain.doFilter(request, response);
    }

    /**
     * Trích xuất JWT token từ header Authorization.
     * Header có dạng: "Bearer eyJhbGciOiJIUzI1NiJ9..."
     * Mình cần phần sau chữ "Bearer " (7 ký tự).
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
