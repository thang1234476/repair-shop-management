package com.repairshop.service;
import com.repairshop.entity.*;
import com.repairshop.enums.NotificationType;
import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void sendNotification(Integer userId, NotificationType type, String title, String message, RepairTicket ticket, Quote quote);
    void notifyTicketCreated(RepairTicket ticket);
    void notifyQuoteAvailable(Quote quote);
    void notifyQuoteConfirmed(Quote quote, Staff staff);
    void notifyQuoteRejected(Quote quote, Staff staff);
    void notifyTicketCompleted(RepairTicket ticket);
    Page<NotificationResponse> getNotifications(Integer userId, Pageable pageable);
    void markAsRead(Integer notificationId, Integer userId);
    void broadcastToCustomers(BroadcastNotificationRequest request);
}
