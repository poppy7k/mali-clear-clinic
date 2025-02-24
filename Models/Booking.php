<?php
require_once 'Database.php';
require_once 'TableManager.php'; // ✅ เรียกใช้ TableManager

class Booking {
    private $conn;
    private $table_name = "bookings";

    public $id;
    public $user_id;
    public $product_id;
    public $booking_date;
    public $status;
    public $full_name;
    public $phone;
    public $address;
    public $created_at;

    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        "user_id" => "INT NOT NULL",
        "product_id" => "INT NOT NULL",
        "full_name" => "VARCHAR(255) NOT NULL",
        "phone" => "VARCHAR(20) NOT NULL",
        "address" => "TEXT NOT NULL",
        "booking_date" => "DATETIME NOT NULL",
        "status" => "VARCHAR(50) DEFAULT 'Pending'",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "CONSTRAINT fk_bookings_user_id" => "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
        "CONSTRAINT fk_bookings_product_id" => "FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE"
    ];
    

    public function __construct($db) {
        $this->conn = $db;

        // ✅ ใช้ TableManager อัปเดตโครงสร้างตาราง
        $tableManager = new TableManager($this->conn);
        $tableManager->validateAndUpdateTableStructure($this->table_name, self::$schema);
    }

    // ✅ เพิ่มการจองใหม่
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (user_id, product_id, full_name, phone, address, booking_date, status) 
                  VALUES 
                  (:user_id, :product_id, :full_name, :phone, :address, :booking_date, :status)";
        
        $stmt = $this->conn->prepare($query);
    
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':product_id', $this->product_id);
        $stmt->bindParam(':full_name', $this->full_name);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':address', $this->address);
        $stmt->bindParam(':booking_date', $this->booking_date);
        $stmt->bindParam(':status', $this->status);
    
        return $stmt->execute();
    }
    

    // ✅ ดึงข้อมูลการจองทั้งหมด
    public function getAll() {
        $sql = "SELECT b.id, b.product_id, p.name AS product_name, 
                b.booking_date, b.status, b.user_id, u.username
                FROM bookings b
                JOIN products p ON b.product_id = p.id
                JOIN users u ON b.user_id = u.id
                ORDER BY b.booking_date DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ✅ อัปเดตสถานะการจอง
    public function updateStatus($bookingId, $status) {
        $validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
        
        if (!in_array($status, $validStatuses)) {
            return false;
        }
        
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $bookingId);
        
        return $stmt->execute();
    }

    // ✅ ดึงการจองตาม User ID
    public function getBookingsByUserId($userId) {
        $sql = "SELECT b.id, b.product_id, p.name AS product_name, 
                b.booking_date, b.status, b.user_id, u.username
                FROM bookings b
                JOIN products p ON b.product_id = p.id
                JOIN users u ON b.user_id = u.id
                WHERE b.user_id = :user_id
                ORDER BY b.booking_date DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    function sendCompletionEmail($userId, $bookingId, $db) {
        // ✅ ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        $stmt = $db->prepare("SELECT full_name, email FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$user) {
            error_log("❌ User not found for user_id: $userId");
            return;
        }
    
        $email = $user['email'];
        $name = $user['full_name'];
        $subject = "การจอง #$bookingId เสร็จสมบูรณ์แล้ว!";
        
        $message = "
            <html>
            <head>
                <title>การจองของคุณเสร็จสมบูรณ์</title>
            </head>
            <body>
                <h3>เรียนคุณ $name,</h3>
                <p>เราขอแจ้งให้ทราบว่า การจองของคุณ (#$bookingId) ได้รับการดำเนินการเสร็จสมบูรณ์แล้ว</p>
                <p>ขอบคุณที่ใช้บริการของเรา!</p>
                <p>ทีมงาน Your Company Name</p>
            </body>
            </html>
        ";
    
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";
        $headers .= "From: maliclearclinic@gmail.com" . "\r\n"; // เปลี่ยนอีเมลของคุณ
    
        if (mail($email, $subject, $message, $headers)) {
            error_log("✅ Email sent to $email for Booking ID #$bookingId");
        } else {
            error_log("❌ Email sending failed for $email");
        }
    }
}
?>
