<?php
require_once 'Database.php';

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $email;
    public $password;
    public $role; // ✅ เพิ่มตัวแปร role
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
            role VARCHAR(20) DEFAULT 'USER', -- ✅ เพิ่ม role เป็นค่าเริ่มต้น 'USER'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    }

    // ✅ ฟังก์ชันสมัครสมาชิก (เก็บ role)
    public function register() {
        $query = "INSERT INTO " . $this->table_name . " (username, email, password, role) VALUES (:username, :email, :password, :role)";
        
        $stmt = $this->conn->prepare($query);

        // กำหนดค่าพารามิเตอร์
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindValue(':role', $this->role ?? 'USER'); // ✅ ใช้ role ที่กำหนด หรือ 'USER' เป็นค่าเริ่มต้น

        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    // ✅ ฟังก์ชันตรวจสอบว่าอีเมล์ซ้ำหรือไม่
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

    // ✅ ฟังก์ชันล็อกอิน (ดึง role ด้วย)
    public function login() {
        $query = "SELECT id, username, password, role FROM " . $this->table_name . " WHERE email = :email LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];        // ✅ เก็บ user_id
                $this->username = $row['username']; // ✅ เก็บ username
                $this->role = $row['role'];    // ✅ เก็บ role
                return true;
            }
        }
        return false; // ถ้ารหัสผ่านผิดหรือไม่พบอีเมล
    }
}
?>
