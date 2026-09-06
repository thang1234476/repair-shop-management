package com.repairshop.entity;
import com.repairshop.enums.Role;
import com.repairshop.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id") private Integer userId;
    @Column(name = "username", nullable = false, unique = true, length = 50) private String username;
    @Column(name = "email", nullable = false, unique = true, length = 100) private String email;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "full_name", nullable = false, length = 100) private String fullName;
    @Column(name = "phone", length = 20) private String phone;
    @Enumerated(EnumType.STRING) @Column(name = "role", nullable = false) private Role role;
    @Enumerated(EnumType.STRING) @Column(name = "status", nullable = false) private UserStatus status;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Customer customerProfile;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Staff staffProfile;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
