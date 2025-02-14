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
            
            // ตรวจสอบการมีอยู่ของตาราง 'users' และสร้างถ้าไม่มี
            $this->createUsersTableIfNotExists();
            
        } catch (PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }

    // ฟังก์ชันสำหรับสร้างตาราง 'users' หากยังไม่มี
    private function createUsersTableIfNotExists() {
        $query = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        // เตรียมคำสั่ง SQL
        $stmt = $this->conn->prepare($query);
    }
}
?>
