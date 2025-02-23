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
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;

        // ✅ ใช้ TableManager เพื่อตรวจสอบและอัปเดตโครงสร้างตาราง
        $tableManager = new TableManager($this->conn);
        $tableManager->validateAndUpdateTableStructure($this->table_name, [
            "id" => "INT AUTO_INCREMENT PRIMARY KEY",
            "user_id" => "INT NOT NULL",
            "product_id" => "INT NOT NULL",
            "booking_date" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "status" => "VARCHAR(50) DEFAULT 'Pending'",
            "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "FOREIGN KEY (user_id)" => "REFERENCES users(id) ON DELETE CASCADE",
            "FOREIGN KEY (product_id)" => "REFERENCES products(id) ON DELETE CASCADE"
        ]);
    }

    // ✅ เพิ่มการจองใหม่
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (user_id, product_id, status) VALUES (:user_id, :product_id, :status)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':product_id', $this->product_id);
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
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':status', $status);

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
}
?>
