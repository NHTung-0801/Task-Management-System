package com.taskmanager.service;

import com.taskmanager.dto.request.LoginRequest;
import com.taskmanager.dto.request.RegisterRequest;
import com.taskmanager.dto.response.AuthResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test cho AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword123")
                .fullName("Nguyen Van A")
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password123");
        registerRequest.setFullName("Nguyen Van A");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Password123");
    }

    // ==========================================
    // CÁC TEST CASES ĐĂNG KÝ (REGISTER)
    // ==========================================

    @Test
    @DisplayName("Đăng ký thành công khi thông tin hợp lệ và chưa ai sử dụng")
    void register_Success() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("hashedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtil.generateToken("testuser")).thenReturn("mocked.jwt.token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getFullName()).isEqualTo("Nguyen Van A");
        assertThat(response.getUserId()).isEqualTo(1L);

        verify(userRepository, times(1)).save(any(User.class));
        verify(passwordEncoder, times(1)).encode("Password123");
        verify(jwtUtil, times(1)).generateToken("testuser");
    }

    @Test
    @DisplayName("Đăng ký thất bại khi username đã tồn tại -> Ném AppException BAD_REQUEST")
    void register_DuplicateUsername_ThrowsAppException() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Tên đăng nhập 'testuser' đã được sử dụng")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    @DisplayName("Đăng ký thất bại khi email đã tồn tại -> Ném AppException BAD_REQUEST")
    void register_DuplicateEmail_ThrowsAppException() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Email 'test@example.com' đã được sử dụng")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtil, never()).generateToken(anyString());
    }

    // ==========================================
    // CÁC TEST CASES ĐĂNG NHẬP (LOGIN)
    // ==========================================

    @Test
    @DisplayName("Đăng nhập thành công khi username và password chính xác")
    void login_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", "hashedPassword123")).thenReturn(true);
        when(jwtUtil.generateToken("testuser")).thenReturn("mocked.jwt.token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getUserId()).isEqualTo(1L);

        verify(userRepository, times(1)).findByUsername("testuser");
        verify(passwordEncoder, times(1)).matches("Password123", "hashedPassword123");
        verify(jwtUtil, times(1)).generateToken("testuser");
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi username không tồn tại -> Ném AppException UNAUTHORIZED")
    void login_UserNotFound_ThrowsAppException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Tên đăng nhập hoặc mật khẩu không chính xác")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu -> Ném AppException UNAUTHORIZED")
    void login_WrongPassword_ThrowsAppException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", "hashedPassword123")).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Tên đăng nhập hoặc mật khẩu không chính xác")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        verify(jwtUtil, never()).generateToken(anyString());
    }
}
