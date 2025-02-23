<?php
require_once 'TableManager.php';
require_once 'User.php';
require_once 'Category.php';
require_once 'Product.php';
require_once 'Booking.php';
require_once 'Promotion.php';

class Database {
    private $host = 'localhost';
    private $db_name = 'maliclearclinic';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host={$this->host};dbname={$this->db_name}", $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // ✅ ตรวจสอบและอัปเดตโครงสร้างตาราง
            $this->initializeTables();
            
        } catch (PDOException $exception) {
            echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
            exit;
        }

        return $this->conn;
    }

    private function initializeTables() {
        $tableManager = new TableManager($this->conn);

        // ✅ ใช้ Schema จาก Model
        $tableManager->validateAndUpdateTableStructure("bookings", Booking::$schema);
        $tableManager->validateAndUpdateTableStructure("users", User::$schema);
        $tableManager->validateAndUpdateTableStructure("categories", Category::$schema);
        $tableManager->validateAndUpdateTableStructure("products", Product::$schema);
        $tableManager->validateAndUpdateTableStructure("promotions", Promotion::$schema);

        error_log ("✅ All tables validated and updated successfully!\n");
    }
}
?>
