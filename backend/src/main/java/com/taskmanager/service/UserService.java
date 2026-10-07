package com.taskmanager.service;

import com.taskmanager.dto.request.ChangePasswordRequest;
import com.taskmanager.dto.request.UpdateProfileRequest;
import com.taskmanager.dto.response.UserProfileResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Service xử lý nghiệp vụ thông tin người dùng và đổi mật khẩu.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AppException("Yêu cầu đăng nhập để thực hiện thao tác", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin người dùng", HttpStatus.UNAUTHORIZED));
    }

    public UserProfileResponse getProfile() {
        return UserProfileResponse.fromEntity(getCurrentUser());
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }

        if (StringUtils.hasText(request.getEmail())) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new AppException("Email '" + newEmail + "' đã được sử dụng bởi tài khoản khác", HttpStatus.BAD_REQUEST);
                }
                user.setEmail(newEmail);
            }
        }

        User saved = userRepository.save(user);
        return UserProfileResponse.fromEntity(saved);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AppException("Mật khẩu hiện tại không chính xác", HttpStatus.BAD_REQUEST);
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new AppException("Mật khẩu mới không được trùng với mật khẩu hiện tại", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
