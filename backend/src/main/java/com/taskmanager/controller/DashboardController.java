package com.taskmanager.controller;

import com.taskmanager.dto.response.DashboardStatsResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "API thống kê tổng quan và công việc sắp tới hạn")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Thống kê tổng số lượng công việc theo từng trạng thái")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = dashboardService.getStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Lấy danh sách các công việc sắp tới hạn (chưa hoàn thành, deadline gần nhất)")
    public ResponseEntity<List<TaskResponse>> getUpcomingTasks(
            @RequestParam(defaultValue = "5") int limit) {
        List<TaskResponse> upcoming = dashboardService.getUpcomingTasks(limit);
        return ResponseEntity.ok(upcoming);
    }
}
