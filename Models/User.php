<?php
require_once 'Database.php';

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $email;
    public $password;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createTableIfNotExists() {
        $query = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'USER',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    }

    // ฟังก์ชันสำหรับสมัครสมาชิก
    public function register() {
        // SQL Statement สำหรับการสมัครสมาชิก
        $query = "INSERT INTO " . $this->table_name . " (username, email, password, role) VALUES (:username, :email, :password, :role)";
        
        // เตรียมคำสั่ง SQL
        $stmt = $this->conn->prepare($query);

        // กำหนดค่าพารามิเตอร์
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindValue(':role', 'USER');

        // ตรวจสอบการบันทึกข้อมูล
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    // ฟังก์ชันสำหรับตรวจสอบว่าอีเมล์ซ้ำหรือไม่
    public function emailExists() {
        $query = "SELECT id, username, email, password FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return true;
        }

        return false;
    }

    // ฟังก์ชันสำหรับเข้าสู่ระบบ
    public function login() {
        $query = "SELECT id, username, password FROM " . $this->table_name . " WHERE email = :email LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();

        // หากพบข้อมูล
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];        // ดึงค่า user_id
                $this->username = $row['username']; // ดึงค่า username
                return true;
            }
        }
        return false; // ถ้ารหัสผ่านผิดหรือไม่พบอีเมล
    }
}
?>
