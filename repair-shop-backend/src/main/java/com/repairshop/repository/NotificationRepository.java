package com.repairshop.repository;
import com.repairshop.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    Page<Notification> findByUserUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);
    long countByUserUserIdAndIsReadFalse(Integer userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :id AND n.user.userId = :userId")
    int markAsRead(@Param("id") Integer id, @Param("userId") Integer userId);
}
