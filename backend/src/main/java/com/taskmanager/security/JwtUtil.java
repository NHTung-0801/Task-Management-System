package com.taskmanager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Công cụ xử lý JWT (JSON Web Token).
 *
 * JWT có cấu trúc: HEADER.PAYLOAD.SIGNATURE
 * - HEADER   : thuật toán mã hóa (HS256)
 * - PAYLOAD  : dữ liệu chứa trong token (username, thời hạn...)
 * - SIGNATURE: chữ ký số, đảm bảo token không bị giả mạo
 *
 * Các phương thức chính:
 * - generateToken(username) → Tạo token mới sau khi đăng nhập thành công
 * - extractUsername(token)  → Đọc username từ token (để biết ai đang gửi request)
 * - validateToken(token)    → Kiểm tra token có hợp lệ và chưa hết hạn không
 */
@Component
public class JwtUtil {

    // Secret key đọc từ application.yml (${jwt.secret}) — KHÔNG hardcode trong code
    @Value("${jwt.secret}")
    private String secretKey;

    // Thời gian sống của token (milliseconds) — mặc định 24 giờ = 86400000ms
    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * Chuyển secretKey (chuỗi Base64) thành đối tượng SecretKey của Java.
     * HMAC-SHA256 yêu cầu key phải đủ độ dài (256 bit trở lên).
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo JWT token chứa username làm subject.
     *
     * - setSubject    → username của người dùng (dùng để tìm user sau này)
     * - setIssuedAt   → thời điểm token được tạo
     * - setExpiration → token hết hạn sau bao lâu
     * - signWith      → ký token bằng secret key (HMAC-SHA256)
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Đọc username từ token.
     * Claims = phần PAYLOAD của JWT (dữ liệu được mã hóa trong token).
     */
    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Kiểm tra token có hợp lệ không.
     * - JwtException     → token bị giả mạo hoặc không đúng định dạng
     * - ExpiredJwtException → đây là subclass của JwtException, token đã hết hạn
     * Cả 2 trường hợp đều bị bắt chung → trả về false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
