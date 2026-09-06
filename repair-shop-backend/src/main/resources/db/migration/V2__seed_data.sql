-- =============================================
-- V2: Seed Data for Demo
-- Passwords are all BCrypt hash of "Password123!"
-- =============================================

-- Admin user
INSERT INTO users (username, email, password_hash, full_name, phone, role, status) VALUES
('admin', 'admin@repairshop.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO', 'Nguyễn Quản Trị', '0901000001', 'ADMIN', 'ACTIVE');

-- Staff users
INSERT INTO users (username, email, password_hash, full_name, phone, role, status) VALUES
('tech_minh', 'minh.kt@repairshop.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO', 'Trần Kỹ Thuật Minh', '0901000002', 'STAFF', 'ACTIVE'),
('recept_lan', 'lan.letan@repairshop.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO', 'Lê Thị Lan', '0901000003', 'STAFF', 'ACTIVE');

-- Customer users
INSERT INTO users (username, email, password_hash, full_name, phone, role, status) VALUES
('customer_an', 'an.nguyen@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO', 'Nguyễn Văn An', '0912345678', 'CUSTOMER', 'ACTIVE'),
('customer_bich', 'bich.tran@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO', 'Trần Thị Bích', '0923456789', 'CUSTOMER', 'ACTIVE'),
('customer_cuong', 'cuong.le@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO', 'Lê Văn Cường', '0934567890', 'CUSTOMER', 'ACTIVE');

-- Staff profiles
INSERT INTO staff (staff_id, position, specialty, hire_date) VALUES
(2, 'TECHNICIAN', 'Điện thoại, Laptop', '2023-01-15'),
(3, 'RECEPTIONIST', NULL, '2023-06-01');

-- Customer profiles
INSERT INTO customers (customer_id, address, date_of_birth, gender, note) VALUES
(4, '123 Lê Lợi, Q1, TP.HCM', '1990-05-15', 'MALE', NULL),
(5, '456 Nguyễn Trãi, Q5, TP.HCM', '1995-08-20', 'FEMALE', 'Khách VIP'),
(6, '789 Võ Văn Tần, Q3, TP.HCM', '1988-03-10', 'MALE', NULL);

-- Parts / Linh kiện
INSERT INTO parts (part_code, part_name, unit, unit_price, quantity_in_stock, min_stock_threshold, supplier) VALUES
('MH-IPHONE13-LCD', 'Màn hình iPhone 13 Original', 'cái', 2500000, 8, 3, 'Công ty Linh kiện ABC'),
('PIN-SAMSUNG-A52', 'Pin Samsung Galaxy A52', 'cái', 350000, 15, 5, 'Kho linh kiện XYZ'),
('BAN_PHIM-LAPTOP-HP', 'Bàn phím Laptop HP EliteBook', 'cái', 850000, 4, 2, 'Nhà phân phối DEF'),
('CHIP-IC-SAC', 'IC sạc iPhone (chung)', 'cái', 120000, 20, 10, 'Nhà phân phối DEF'),
('CAM-TRUOC-OPPO', 'Camera trước OPPO A54', 'cái', 280000, 3, 3, 'Công ty Linh kiện ABC');

-- Devices
INSERT INTO devices (customer_id, device_type, brand, model, serial_number, imei, initial_condition) VALUES
(4, 'Điện thoại', 'Apple', 'iPhone 13', 'SN123456789', '123456789012345', 'Màn hình vỡ góc trên phải, máy vẫn hoạt động bình thường'),
(5, 'Laptop', 'HP', 'EliteBook 840 G8', 'HP840G8-2023-001', NULL, 'Bàn phím một số phím không gõ được, máy bình thường'),
(6, 'Điện thoại', 'Samsung', 'Galaxy A52', 'SAA52-SN-98765', '987654321098765', 'Pin tụt nhanh, sạc không vào');

-- Repair Tickets
INSERT INTO repair_tickets (ticket_code, customer_id, device_id, staff_id, status, issue_description, diagnosis_notes, created_at) VALUES
('TK-2024-001', 4, 1, 2, 'DELIVERED', 'Màn hình bị vỡ, cần thay', 'Màn hình bị vỡ lớp kính và LCD, cần thay toàn bộ cụm màn hình', '2024-01-10 09:00:00'),
('TK-2024-002', 5, 2, 2, 'COMPLETED', 'Bàn phím laptop hỏng nhiều phím', 'Bàn phím bị hỏng do tràn nước, cần thay nguyên cụm', '2024-01-15 10:30:00'),
('TK-2024-003', 6, 3, 2, 'REPAIRING', 'Pin tụt nhanh, không sạc được', 'Pin bị phồng, IC sạc hỏng, cần thay cả pin và IC sạc', '2024-01-20 14:00:00'),
('TK-2024-004', 4, 1, 2, 'QUOTED', 'Cần kiểm tra camera sau bị mờ', 'Camera sau bị mờ do đứt cáp flex, cần thay cáp camera', '2024-01-25 09:30:00'),
('TK-2024-005', 5, 2, NULL, 'RECEIVED', 'Máy bị chậm, lag nhiều', NULL, '2024-01-28 11:00:00');

-- Status history for tickets
INSERT INTO ticket_status_history (ticket_id, status, note, changed_by, changed_at) VALUES
(1, 'RECEIVED', 'Tiếp nhận máy từ khách hàng', 2, '2024-01-10 09:00:00'),
(1, 'DIAGNOSING', 'Bắt đầu chẩn đoán', 2, '2024-01-10 10:00:00'),
(1, 'QUOTED', 'Đã tạo báo giá', 2, '2024-01-10 11:00:00'),
(1, 'APPROVED', 'Khách hàng chấp nhận báo giá', 2, '2024-01-11 09:00:00'),
(1, 'REPAIRING', 'Đang tiến hành sửa chữa', 2, '2024-01-11 10:00:00'),
(1, 'COMPLETED', 'Sửa chữa hoàn tất', 2, '2024-01-12 16:00:00'),
(1, 'DELIVERED', 'Đã bàn giao máy cho khách', 2, '2024-01-13 10:00:00'),
(2, 'RECEIVED', 'Tiếp nhận máy', 3, '2024-01-15 10:30:00'),
(2, 'DIAGNOSING', 'Chẩn đoán bàn phím', 2, '2024-01-15 14:00:00'),
(2, 'QUOTED', 'Tạo báo giá', 2, '2024-01-16 09:00:00'),
(2, 'APPROVED', 'Khách đồng ý', 2, '2024-01-16 14:00:00'),
(2, 'REPAIRING', 'Đang sửa', 2, '2024-01-17 09:00:00'),
(2, 'COMPLETED', 'Hoàn tất sửa laptop', 2, '2024-01-18 17:00:00'),
(3, 'RECEIVED', 'Tiếp nhận điện thoại', 3, '2024-01-20 14:00:00'),
(3, 'DIAGNOSING', 'Kiểm tra pin và IC sạc', 2, '2024-01-21 09:00:00'),
(3, 'QUOTED', 'Đã báo giá', 2, '2024-01-21 11:00:00'),
(3, 'APPROVED', 'Khách đồng ý sửa', 2, '2024-01-22 08:00:00'),
(3, 'REPAIRING', 'Đang thay pin và IC sạc', 2, '2024-01-22 09:00:00'),
(4, 'RECEIVED', 'Tiếp nhận kiểm tra camera', 2, '2024-01-25 09:30:00'),
(4, 'DIAGNOSING', 'Đang kiểm tra camera', 2, '2024-01-25 10:00:00'),
(4, 'QUOTED', 'Đã báo giá sửa camera', 2, '2024-01-25 15:00:00'),
(5, 'RECEIVED', 'Tiếp nhận máy laptop chậm', 3, '2024-01-28 11:00:00');

-- Quotes
INSERT INTO quotes (ticket_id, total_amount, status, created_by, created_at, responded_at) VALUES
(1, 2700000, 'ACCEPTED', 2, '2024-01-10 11:00:00', '2024-01-11 09:00:00'),
(2, 950000, 'ACCEPTED', 2, '2024-01-16 09:00:00', '2024-01-16 14:00:00'),
(3, 580000, 'ACCEPTED', 2, '2024-01-21 11:00:00', '2024-01-22 08:00:00'),
(4, 300000, 'PENDING', 2, '2024-01-25 15:00:00', NULL);

-- Quote Items
INSERT INTO quote_items (quote_id, item_type, part_id, description, quantity, unit_price) VALUES
(1, 'PART', 1, 'Màn hình iPhone 13 Original', 1, 2500000),
(1, 'LABOR', NULL, 'Công thay màn hình', 1, 200000),
(2, 'PART', 3, 'Bàn phím Laptop HP EliteBook', 1, 850000),
(2, 'LABOR', NULL, 'Công thay bàn phím', 1, 100000),
(3, 'PART', 2, 'Pin Samsung Galaxy A52', 1, 350000),
(3, 'PART', 4, 'IC sạc iPhone (chung)', 1, 120000),
(3, 'LABOR', NULL, 'Công thay pin + IC sạc', 1, 110000),
(4, 'LABOR', NULL, 'Công kiểm tra và thay cáp camera', 1, 200000),
(4, 'PART', NULL, 'Cáp flex camera sau', 1, 100000);

-- Invoices
INSERT INTO invoices (invoice_code, ticket_id, customer_id, subtotal, tax, discount, final_amount, status, issued_by, issued_at) VALUES
('INV-2024-001', 1, 4, 2700000, 0, 0, 2700000, 'PAID', 2, '2024-01-12 16:30:00'),
('INV-2024-002', 2, 5, 950000, 0, 50000, 900000, 'UNPAID', 2, '2024-01-18 17:30:00');

-- Payments
INSERT INTO payments (invoice_id, amount, payment_method, payment_date, received_by, note) VALUES
(1, 2700000, 'CASH', '2024-01-13 10:00:00', 2, 'Thanh toán toàn bộ bằng tiền mặt khi nhận máy');

-- Inventory transactions
INSERT INTO inventory_transactions (part_id, type, quantity, related_ticket_id, performed_by, transaction_date, note) VALUES
(1, 'IN', 10, NULL, 2, '2024-01-05 09:00:00', 'Nhập kho đầu kỳ màn hình iPhone 13'),
(2, 'IN', 20, NULL, 2, '2024-01-05 09:00:00', 'Nhập kho đầu kỳ pin Samsung A52'),
(3, 'IN', 5, NULL, 2, '2024-01-05 09:00:00', 'Nhập kho bàn phím HP'),
(4, 'IN', 25, NULL, 2, '2024-01-05 09:00:00', 'Nhập kho IC sạc'),
(5, 'IN', 5, NULL, 2, '2024-01-05 09:00:00', 'Nhập kho camera OPPO'),
(1, 'OUT', 1, 1, 2, '2024-01-11 10:30:00', 'Xuất kho cho phiếu TK-2024-001'),
(3, 'OUT', 1, 2, 2, '2024-01-17 09:30:00', 'Xuất kho cho phiếu TK-2024-002'),
(2, 'OUT', 1, 3, 2, '2024-01-22 09:30:00', 'Xuất kho pin cho phiếu TK-2024-003'),
(4, 'OUT', 1, 3, 2, '2024-01-22 09:35:00', 'Xuất kho IC sạc cho phiếu TK-2024-003');

-- Notifications
INSERT INTO notifications (user_id, type, title, message, related_ticket_id, is_read, created_at) VALUES
(4, 'TICKET_CREATED', 'Phiếu sửa chữa đã được tạo', 'Phiếu TK-2024-001 đã được tạo. Chúng tôi sẽ liên hệ khi có kết quả chẩn đoán.', 1, TRUE, '2024-01-10 09:05:00'),
(4, 'QUOTE_AVAILABLE', 'Báo giá sửa chữa đã sẵn sàng', 'Phiếu TK-2024-001: Báo giá 2,700,000 đồng. Vui lòng xác nhận để tiến hành sửa chữa.', 1, TRUE, '2024-01-10 11:05:00'),
(4, 'TICKET_COMPLETED', 'Thiết bị đã sửa xong', 'Phiếu TK-2024-001: Thiết bị iPhone 13 của bạn đã sửa xong. Vui lòng đến nhận.', 1, TRUE, '2024-01-12 16:05:00'),
(5, 'TICKET_CREATED', 'Phiếu sửa chữa đã được tạo', 'Phiếu TK-2024-002 đã được tạo cho laptop HP của bạn.', 2, TRUE, '2024-01-15 10:35:00'),
(5, 'TICKET_COMPLETED', 'Laptop đã sửa xong', 'Phiếu TK-2024-002: Laptop HP EliteBook của bạn đã sửa xong. Vui lòng đến nhận và thanh toán.', 2, FALSE, '2024-01-18 17:05:00'),
(6, 'TICKET_CREATED', 'Phiếu sửa chữa đã được tạo', 'Phiếu TK-2024-003 đã được tạo cho Samsung A52 của bạn.', 3, TRUE, '2024-01-20 14:05:00'),
(6, 'QUOTE_AVAILABLE', 'Báo giá sửa chữa đã sẵn sàng', 'Phiếu TK-2024-003: Báo giá 580,000 đồng để thay pin và IC sạc.', 3, TRUE, '2024-01-21 11:05:00'),
(4, 'TICKET_CREATED', 'Phiếu sửa chữa mới đã tạo', 'Phiếu TK-2024-004 đã được tạo để kiểm tra camera iPhone 13.', 4, TRUE, '2024-01-25 09:35:00'),
(4, 'QUOTE_AVAILABLE', 'Báo giá mới đang chờ xác nhận', 'Phiếu TK-2024-004: Báo giá 300,000 đồng. Vui lòng xác nhận.', 4, FALSE, '2024-01-25 15:05:00'),
(5, 'TICKET_CREATED', 'Phiếu sửa chữa đã được tạo', 'Phiếu TK-2024-005 đã được tạo cho laptop HP của bạn.', 5, FALSE, '2024-01-28 11:05:00');
