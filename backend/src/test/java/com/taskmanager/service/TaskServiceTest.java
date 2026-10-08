package com.taskmanager.service;

import com.taskmanager.dto.request.CreateTaskRequest;
import com.taskmanager.dto.request.UpdateTaskRequest;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test cho TaskService (Bao gồm User Isolation Security)")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User userA;
    private User userB;
    private Task taskA;
    private Task taskB;

    @BeforeEach
    void setUp() {
        // User A: người dùng chính đăng nhập trong phiên test (ID = 1)
        userA = User.builder()
                .id(1L)
                .username("usera")
                .email("usera@example.com")
                .fullName("User A")
                .passwordHash("hashA")
                .build();

        // User B: người dùng khác trong hệ thống (ID = 2) dùng để test User Isolation
        userB = User.builder()
                .id(2L)
                .username("userb")
                .email("userb@example.com")
                .fullName("User B")
                .passwordHash("hashB")
                .build();

        // Task A thuộc về User A
        taskA = Task.builder()
                .id(100L)
                .title("Task của User A")
                .description("Mô tả của task A")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.of(2026, 12, 31))
                .user(userA)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Task B thuộc về User B
        taskB = Task.builder()
                .id(200L)
                .title("Task của User B")
                .description("Mô tả của task B")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.MEDIUM)
                .dueDate(LocalDate.of(2026, 11, 30))
                .user(userB)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Giả lập phiên đăng nhập của User A
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("usera", null, Collections.emptyList())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ==========================================
    // 1. TẠO CÔNG VIỆC (CREATE TASK)
    // ==========================================

    @Test
    @DisplayName("Tạo task thành công và gán đúng quyền sở hữu cho User đăng nhập")
    void createTask_Success() {
        // Arrange
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Công việc mới")
                .description("Chi tiết công việc")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.of(2026, 10, 15))
                .build();

        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.save(any(Task.class))).thenReturn(taskA);

        // Act
        TaskResponse response = taskService.createTask(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Task của User A");
        assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(response.getPriority()).isEqualTo(TaskPriority.HIGH);

        verify(taskRepository, times(1)).save(argThat(task ->
                task.getUser().getId().equals(1L) &&
                task.getTitle().equals("Công việc mới")
        ));
    }

    @Test
    @DisplayName("Tạo task tự động gán giá trị mặc định TODO và MEDIUM khi request để trống")
    void createTask_DefaultValues_WhenStatusAndPriorityNull() {
        // Arrange
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Task không truyền status & priority")
                .build();

        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.save(any(Task.class))).thenReturn(taskA);

        // Act
        taskService.createTask(request);

        // Assert
        verify(taskRepository).save(argThat(task ->
                task.getStatus() == TaskStatus.TODO &&
                task.getPriority() == TaskPriority.MEDIUM
        ));
    }

    // ==========================================
    // 2. XEM CHI TIẾT & USER ISOLATION
    // ==========================================

    @Test
    @DisplayName("Xem chi tiết thành công khi task thuộc về User hiện tại")
    void getTaskById_Success_WhenBelongsToCurrentUser() {
        // Arrange
        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(100L)).thenReturn(Optional.of(taskA));

        // Act
        TaskResponse response = taskService.getTaskById(100L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Task của User A");
    }

    @Test
    @DisplayName("User Isolation: Chặn User A xem task của User B -> Ném AppException FORBIDDEN (403)")
    void getTaskById_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser() {
        // Arrange
        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(200L)).thenReturn(Optional.of(taskB)); // Task B thuộc user B

        // Act & Assert
        assertThatThrownBy(() -> taskService.getTaskById(200L))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Bạn không có quyền truy cập công việc này")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Xem chi tiết thất bại khi task không tồn tại -> Ném AppException NOT_FOUND (404)")
    void getTaskById_NotFound_ThrowsNotFound() {
        // Arrange
        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> taskService.getTaskById(999L))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Công việc không tồn tại")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ==========================================
    // 3. CẬP NHẬT & USER ISOLATION
    // ==========================================

    @Test
    @DisplayName("Cập nhật task thành công khi task thuộc về User hiện tại")
    void updateTask_Success_WhenBelongsToCurrentUser() {
        // Arrange
        UpdateTaskRequest request = UpdateTaskRequest.builder()
                .title("Tiêu đề đã sửa")
                .description("Mô tả mới")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.LOW)
                .dueDate(LocalDate.of(2026, 12, 1))
                .build();

        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(100L)).thenReturn(Optional.of(taskA));
        when(taskRepository.save(any(Task.class))).thenReturn(taskA);

        // Act
        TaskResponse response = taskService.updateTask(100L, request);

        // Assert
        assertThat(response).isNotNull();
        verify(taskRepository, times(1)).save(taskA);
        assertThat(taskA.getTitle()).isEqualTo("Tiêu đề đã sửa");
        assertThat(taskA.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(taskA.getPriority()).isEqualTo(TaskPriority.LOW);
    }

    @Test
    @DisplayName("User Isolation: Chặn User A sửa task của User B -> Ném AppException FORBIDDEN (403)")
    void updateTask_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser() {
        // Arrange
        UpdateTaskRequest request = UpdateTaskRequest.builder()
                .title("Cố tình sửa task người khác")
                .build();

        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(200L)).thenReturn(Optional.of(taskB)); // Task B thuộc user B

        // Act & Assert
        assertThatThrownBy(() -> taskService.updateTask(200L, request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Bạn không có quyền sửa công việc này")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);

        verify(taskRepository, never()).save(any(Task.class));
    }

    // ==========================================
    // 4. XÓA CÔNG VIỆC & USER ISOLATION
    // ==========================================

    @Test
    @DisplayName("Xóa task thành công khi task thuộc về User hiện tại")
    void deleteTask_Success_WhenBelongsToCurrentUser() {
        // Arrange
        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(100L)).thenReturn(Optional.of(taskA));

        // Act
        taskService.deleteTask(100L);

        // Assert
        verify(taskRepository, times(1)).delete(taskA);
    }

    @Test
    @DisplayName("User Isolation: Chặn User A xóa task của User B -> Ném AppException FORBIDDEN (403)")
    void deleteTask_UserIsolation_ThrowsForbidden_WhenBelongsToAnotherUser() {
        // Arrange
        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findById(200L)).thenReturn(Optional.of(taskB)); // Task B thuộc user B

        // Act & Assert
        assertThatThrownBy(() -> taskService.deleteTask(200L))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Bạn không có quyền xóa công việc này")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);

        verify(taskRepository, never()).delete(any(Task.class));
    }

    // ==========================================
    // 5. TRUY VẤN DANH SÁCH & PHÂN TRANG
    // ==========================================

    @Test
    @DisplayName("Lấy danh sách công việc có phân trang và lọc dữ liệu thành công")
    @SuppressWarnings("unchecked")
    void getTasks_Success_WithPaginationAndFilter() {
        // Arrange
        Page<Task> page = new PageImpl<>(List.of(taskA));
        when(userRepository.findByUsername("usera")).thenReturn(Optional.of(userA));
        when(taskRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        // Act
        PageResponse<TaskResponse> result = taskService.getTasks(
                "Task", TaskStatus.TODO, TaskPriority.HIGH, 0, 10, "createdAt", "desc"
        );

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Task của User A");

        verify(taskRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }

    // ==========================================
    // 6. XÁC THỰC PHIÊN ĐĂNG NHẬP (AUTH CHECK)
    // ==========================================

    @Test
    @DisplayName("Ném AppException UNAUTHORIZED (401) khi chưa đăng nhập")
    void getCurrentUser_Unauthenticated_ThrowsUnauthorized() {
        // Arrange: Xóa Authentication khỏi SecurityContext
        SecurityContextHolder.clearContext();

        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Task khi chưa login")
                .build();

        // Act & Assert
        assertThatThrownBy(() -> taskService.createTask(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Yêu cầu đăng nhập để thực hiện thao tác")
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        verify(taskRepository, never()).save(any(Task.class));
    }
}
