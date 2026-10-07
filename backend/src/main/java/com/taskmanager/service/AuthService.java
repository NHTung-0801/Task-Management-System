package com.taskmanager.service;

import com.taskmanager.dto.request.LoginRequest;
import com.taskmanager.dto.request.RegisterRequest;
import com.taskmanager.dto.response.AuthResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý nghiệp vụ xác thực người dùng.
 *
 * @Transactional → Đảm bảo toàn bộ phương thức là 1 transaction:
 *   nếu có bất kỳ lỗi nào xảy ra ở giữa, DB sẽ rollback về trạng thái ban đầu.
 *   Áp dụng cho register() để tránh tình trạng user được tạo nhưng task seed bị lỗi.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Đăng ký tài khoản mới.
     *
     * Luồng xử lý:
     * 1. Kiểm tra username chưa tồn tại trong DB
     * 2. Kiểm tra email chưa tồn tại trong DB
     * 3. Băm mật khẩu bằng BCrypt (KHÔNG lưu mật khẩu gốc)
     * 4. Tạo và lưu User vào DB
     * 5. Tạo JWT token cho user mới
     * 6. Trả về AuthResponse chứa token + thông tin user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Bước 1: Kiểm tra username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Tên đăng nhập '" + request.getUsername() + "' đã được sử dụng", HttpStatus.BAD_REQUEST);
        }

        // Bước 2: Kiểm tra email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email '" + request.getEmail() + "' đã được sử dụng", HttpStatus.BAD_REQUEST);
        }

        // Bước 3: Băm mật khẩu — encode("123456") → "$2a$10$..."
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Bước 4: Tạo và lưu User
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .fullName(request.getFullName())
                .build();
        userRepository.save(user);

        // Bước 5 & 6: Tạo token và trả response
        String token = jwtUtil.generateToken(user.getUsername());
        return buildAuthResponse(token, user);
    }

    /**
     * Đăng nhập.
     *
     * Luồng xử lý:
     * 1. Tìm user theo username trong DB
     * 2. So sánh mật khẩu nhập vào với hash đã lưu bằng BCrypt
     *    → BCrypt.matches("123456", "$2a$10$...") trả về true/false
     * 3. Nếu đúng → tạo JWT token và trả về
     *
     * Lưu ý bảo mật: Không nói rõ "sai username" hay "sai mật khẩu"
     * → Trả về thông báo chung để tránh kẻ tấn công dò được username tồn tại.
     */
    public AuthResponse login(LoginRequest request) {
        // Bước 1: Tìm user
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException("Tên đăng nhập hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED));

        // Bước 2: Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException("Tên đăng nhập hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED);
        }

        // Bước 3: Tạo token và trả response
        String token = jwtUtil.generateToken(user.getUsername());
        return buildAuthResponse(token, user);
    }

    /**
     * Helper: Tạo AuthResponse từ token và User entity.
     * Tách ra để tránh lặp code giữa register() và login().
     */
    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
