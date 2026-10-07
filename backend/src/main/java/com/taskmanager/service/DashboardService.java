package com.taskmanager.service;

import com.taskmanager.dto.response.DashboardStatsResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException("Yêu cầu đăng nhập để thực hiện thao tác", HttpStatus.UNAUTHORIZED);
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin người dùng", HttpStatus.UNAUTHORIZED));
    }

    public DashboardStatsResponse getStats() {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        long totalTasks = taskRepository.countByUserId(userId);
        long todoTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
        long inProgressTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long doneTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.DONE);

        return DashboardStatsResponse.builder()
                .totalTasks(totalTasks)
                .todoTasks(todoTasks)
                .inProgressTasks(inProgressTasks)
                .doneTasks(doneTasks)
                .build();
    }

    public List<TaskResponse> getUpcomingTasks(int limit) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        int safeLimit = (limit <= 0 || limit > 50) ? 5 : limit;
        Pageable pageable = PageRequest.of(0, safeLimit);

        List<Task> tasks = taskRepository.findUpcomingTasks(userId, TaskStatus.DONE, pageable);
        return tasks.stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }
}
