package com.taskmanager.repository;

import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho Entity User.
 *
 * JpaRepository<User, Long> cung cấp sẵn các phương thức CRUD cơ bản:
 * - save(user)         → INSERT hoặc UPDATE
 * - findById(id)       → SELECT WHERE id = ?
 * - findAll()          → SELECT * FROM users
 * - deleteById(id)     → DELETE WHERE id = ?
 * - count()            → SELECT COUNT(*) FROM users
 *
 * Các phương thức dưới đây là "Derived Query" — Spring Data tự sinh SQL từ tên hàm:
 * - findByUsername     → SELECT * FROM users WHERE username = ?
 * - existsByUsername   → SELECT EXISTS (... WHERE username = ?)
 * - existsByEmail      → SELECT EXISTS (... WHERE email = ?)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user theo username — dùng khi đăng nhập để load user ra kiểm tra mật khẩu
    Optional<User> findByUsername(String username);

    // Kiểm tra username đã tồn tại chưa — dùng khi đăng ký để tránh trùng lặp
    boolean existsByUsername(String username);

    // Kiểm tra email đã tồn tại chưa — dùng khi đăng ký để tránh trùng lặp
    boolean existsByEmail(String email);
}
