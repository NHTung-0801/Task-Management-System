package com.taskmanager.service;

import com.taskmanager.dto.request.CreateTaskRequest;
import com.taskmanager.dto.request.UpdateTaskRequest;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

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

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = Task.builder()
                .user(currentUser)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .build();

        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(savedTask);
    }

    public TaskResponse getTaskById(Long id) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new AppException("Công việc không tồn tại", HttpStatus.NOT_FOUND));

        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new AppException("Bạn không có quyền truy cập công việc này", HttpStatus.FORBIDDEN);
        }

        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new AppException("Công việc không tồn tại", HttpStatus.NOT_FOUND));

        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new AppException("Bạn không có quyền sửa công việc này", HttpStatus.FORBIDDEN);
        }

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDueDate(request.getDueDate());

        Task updatedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new AppException("Công việc không tồn tại", HttpStatus.NOT_FOUND));

        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new AppException("Bạn không có quyền xóa công việc này", HttpStatus.FORBIDDEN);
        }

        taskRepository.delete(task);
    }
}
