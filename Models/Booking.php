<?php
require_once 'Database.php';

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
    }

    public function createTableIfNotExists() {
        $query = "
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    }

    // เพิ่มการจองใหม่
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (user_id, product_id, status) VALUES (:user_id, :product_id, :status)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':product_id', $this->product_id);
        $stmt->bindParam(':status', $this->status);

        return $stmt->execute();
    }

    // ดึงข้อมูลการจองทั้งหมด
    public function readAll() {
        $sql = "SELECT b.id, b.product_id, p.name AS product_name, b.booking_date, b.status, b.user_id, u.username
                FROM bookings b
                JOIN products p ON b.product_id = p.id
                JOIN users u ON b.user_id = u.id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // ดึงข้อมูลการจองตาม ID
    public function readById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // อัปเดตสถานะการจอง
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':status', $status);

        return $stmt->execute();
    }
}
?>
