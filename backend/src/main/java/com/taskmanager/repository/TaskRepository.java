package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    Page<Task> findAllByUserId(Long userId, Pageable pageable);

    long countByUserIdAndStatus(Long userId, TaskStatus status);

    long countByUserId(Long userId);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.status != :doneStatus AND t.dueDate IS NOT NULL ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasks(@Param("userId") Long userId, @Param("doneStatus") TaskStatus doneStatus, Pageable pageable);
}
