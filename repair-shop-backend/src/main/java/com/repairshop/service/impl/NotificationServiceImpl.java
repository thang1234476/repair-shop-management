package com.repairshop.service.impl;

import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.response.NotificationResponse;
import com.repairshop.entity.Notification;
import com.repairshop.entity.Quote;
import com.repairshop.entity.RepairTicket;
import com.repairshop.entity.User;
import com.repairshop.enums.NotificationType;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.NotificationRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendNotification(Integer userId, NotificationType type, String title, String message, RepairTicket ticket, Quote quote) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedTicket(ticket);
        notification.setRelatedQuote(quote);
        notification.setIsRead(false);
        notificationRepository.save(notification);
        // Push via WebSocket
        NotificationResponse response = mapToResponse(notification);
        messagingTemplate.convertAndSend("/queue/notifications/" + userId, response);
    }

    @Override
    public Page<NotificationResponse> getNotifications(Integer userId, Pageable pageable) {
        return notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void markAsRead(Integer notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new com.repairshop.exception.BadRequestException("Not authorized to mark this notification as read");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void broadcastToCustomers(BroadcastNotificationRequest request) {
        // Find all customer users and send notification
        userRepository.findAll().stream()
            .filter(u -> u.getRole() == com.repairshop.enums.Role.CUSTOMER)
            .forEach(u -> sendNotification(u.getUserId(), NotificationType.STATUS_UPDATE, request.getTitle(), request.getMessage(), null, null));
    }

    @Override
    public void notifyTicketCreated(RepairTicket ticket) {
        sendNotification(ticket.getCustomer().getUser().getUserId(), NotificationType.TICKET_CREATED, 
            "Ticket Created", "Your ticket " + ticket.getTicketCode() + " has been created.", ticket, null);
    }

    @Override
    public void notifyTicketCompleted(RepairTicket ticket) {
        sendNotification(ticket.getCustomer().getUser().getUserId(), NotificationType.TICKET_COMPLETED, 
            "Ticket Completed", "Your ticket " + ticket.getTicketCode() + " has been completed.", ticket, null);
    }

    @Override
    public void notifyQuoteAvailable(Quote quote) {
        sendNotification(quote.getTicket().getCustomer().getUser().getUserId(), NotificationType.QUOTE_AVAILABLE, 
            "Quote Available", "A quote for your ticket " + quote.getTicket().getTicketCode() + " is ready for review.", quote.getTicket(), quote);
    }

    @Override
    public void notifyQuoteConfirmed(Quote quote, com.repairshop.entity.Staff staff) {
        if (staff != null && staff.getUser() != null) {
            sendNotification(staff.getUser().getUserId(), NotificationType.QUOTE_CONFIRMED, 
                "Quote Accepted", "Customer accepted the quote for ticket " + quote.getTicket().getTicketCode(), quote.getTicket(), quote);
        }
    }

    @Override
    public void notifyQuoteRejected(Quote quote, com.repairshop.entity.Staff staff) {
        if (staff != null && staff.getUser() != null) {
            sendNotification(staff.getUser().getUserId(), NotificationType.QUOTE_REJECTED, 
                "Quote Rejected", "Customer rejected the quote for ticket " + quote.getTicket().getTicketCode(), quote.getTicket(), quote);
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setNotificationId(n.getNotificationId());
        r.setType(n.getType().name());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setIsRead(n.getIsRead());
        r.setCreatedAt(n.getCreatedAt());
        if (n.getRelatedTicket() != null) {
            r.setRelatedTicketId(n.getRelatedTicket().getTicketId());
        }
        if (n.getRelatedQuote() != null) r.setRelatedQuoteId(n.getRelatedQuote().getQuoteId());
        return r;
    }
}
