package com.repairshop.entity;
import com.repairshop.enums.StaffPosition;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "staff")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Staff {
    @Id @Column(name = "staff_id") private Integer staffId;
    @OneToOne @MapsId @JoinColumn(name = "staff_id") private User user;
    @Enumerated(EnumType.STRING) @Column(name = "position", nullable = false) private StaffPosition position;
    @Column(name = "specialty") private String specialty;
    @Column(name = "hire_date") private LocalDate hireDate;
}
