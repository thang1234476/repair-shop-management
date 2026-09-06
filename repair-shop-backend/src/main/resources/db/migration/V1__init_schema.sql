-- =============================================
-- V1: Initial Schema for Repair Shop Management
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER','STAFF','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    status ENUM('ACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    address VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('MALE','FEMALE','OTHER'),
    note TEXT,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
    staff_id INT PRIMARY KEY,
    position ENUM('TECHNICIAN','RECEPTIONIST','MANAGER') NOT NULL DEFAULT 'TECHNICIAN',
    specialty VARCHAR(100),
    hire_date DATE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    imei VARCHAR(50),
    initial_condition TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS repair_tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(30) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    device_id INT NOT NULL,
    staff_id INT,
    status ENUM('RECEIVED','DIAGNOSING','QUOTED','APPROVED','REPAIRING','COMPLETED','DELIVERED','CANCELLED','REJECTED') NOT NULL DEFAULT 'RECEIVED',
    issue_description TEXT,
    diagnosis_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS ticket_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    note TEXT,
    changed_by INT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES repair_tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS parts (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(30) NOT NULL UNIQUE,
    part_name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'cái',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    min_stock_threshold INT DEFAULT 5,
    supplier VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    type ENUM('IN','OUT') NOT NULL,
    quantity INT NOT NULL,
    related_ticket_id INT,
    performed_by INT NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (related_ticket_id) REFERENCES repair_tickets(ticket_id),
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS quotes (
    quote_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'PENDING',
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    customer_note TEXT,
    FOREIGN KEY (ticket_id) REFERENCES repair_tickets(ticket_id),
    FOREIGN KEY (created_by) REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS quote_items (
    quote_item_id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT NOT NULL,
    item_type ENUM('PART','LABOR','OTHER') NOT NULL DEFAULT 'PART',
    part_id INT,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (quote_id) REFERENCES quotes(quote_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_code VARCHAR(30) NOT NULL UNIQUE,
    ticket_id INT NOT NULL,
    customer_id INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    status ENUM('UNPAID','PARTIALLY_PAID','PAID') NOT NULL DEFAULT 'UNPAID',
    issued_by INT NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES repair_tickets(ticket_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (issued_by) REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('CASH','BANK_TRANSFER','CARD','E_WALLET') NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    received_by INT NOT NULL,
    note TEXT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
    FOREIGN KEY (received_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('TICKET_CREATED','QUOTE_AVAILABLE','QUOTE_CONFIRMED','QUOTE_REJECTED','TICKET_COMPLETED','STATUS_UPDATE') NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    related_ticket_id INT,
    related_quote_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (related_ticket_id) REFERENCES repair_tickets(ticket_id),
    FOREIGN KEY (related_quote_id) REFERENCES quotes(quote_id)
);

-- Indexes
CREATE INDEX idx_tickets_customer ON repair_tickets(customer_id);
CREATE INDEX idx_tickets_staff ON repair_tickets(staff_id);
CREATE INDEX idx_tickets_status ON repair_tickets(status);
CREATE INDEX idx_devices_customer ON devices(customer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_inventory_part ON inventory_transactions(part_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
