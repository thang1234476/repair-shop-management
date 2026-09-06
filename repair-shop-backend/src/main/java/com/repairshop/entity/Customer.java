package com.repairshop.entity;
import com.repairshop.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity @Table(name = "customers")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Customer {
    @Id @Column(name = "customer_id") private Integer customerId;
    @OneToOne @MapsId @JoinColumn(name = "customer_id") private User user;
    @Column(name = "address") private String address;
    @Column(name = "date_of_birth") private LocalDate dateOfBirth;
    @Enumerated(EnumType.STRING) @Column(name = "gender") private Gender gender;
    @Column(name = "note", columnDefinition = "TEXT") private String note;
    @OneToMany(mappedBy = "customer") private List<Device> devices;
    @OneToMany(mappedBy = "customer") private List<RepairTicket> tickets;
}
