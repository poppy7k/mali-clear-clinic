<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'maliclearclinic';
    private $username = 'root';  // ชื่อผู้ใช้ MySQL
    private $password = '';      // รหัสผ่าน MySQL
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host={$this->host};dbname={$this->db_name}", $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // ตรวจสอบและสร้างตาราง 'users' ถ้ายังไม่มี
            $this->initializeTables();
            
        } catch (PDOException $exception) {
            echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
            exit;
        }

        return $this->conn;
    }

    private function initializeTables() {
        require_once 'User.php';
        require_once 'Category.php';
        require_once 'Product.php';
        require_once 'Booking.php';

        $user = new User($this->conn);
        $category = new Category($this->conn);
        $product = new Product($this->conn);
        $booking = new Booking($this->conn);

        $user->createTableIfNotExists();
        $category->createTableIfNotExists();
        $product->createTableIfNotExists();
        $booking->createTableIfNotExists();
    }
}
?>
