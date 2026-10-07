package com.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Lớp khởi chạy chính của ứng dụng Spring Boot.
 * Annotation @SpringBootApplication kết hợp 3 chức năng:
 *   - @Configuration: Cho phép khai báo Bean
 *   - @EnableAutoConfiguration: Tự động cấu hình dựa trên dependencies trong pom.xml
 *   - @ComponentScan: Quét tất cả các package con để tìm @Controller, @Service, @Repository...
 */
@SpringBootApplication
public class TaskManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
