<?php
require_once 'Database.php';

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $email;
    public $password;
    public $full_name;
    public $phone;
    public $address;
    public $role; 
    public $created_at;

    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        "username" => "VARCHAR(50) NOT NULL UNIQUE",
        "email" => "VARCHAR(100) NOT NULL UNIQUE",
        "password" => "VARCHAR(255) NOT NULL",
        "full_name" => "VARCHAR(255) DEFAULT NULL",
        "phone" => "VARCHAR(15) DEFAULT NULL",
        "address" => "TEXT DEFAULT NULL",
        "role" => "ENUM('USER', 'ADMIN') DEFAULT 'USER'",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];

    public function __construct($db) {
        $this->conn = $db;

        // ✅ ตรวจสอบและอัปเดตโครงสร้างตาราง
        $tableManager = new TableManager($this->conn);
        $tableManager->validateAndUpdateTableStructure($this->table_name, self::$schema);
    }

    // ✅ ฟังก์ชันสมัครสมาชิก (สามารถเลือกใส่หรือไม่ใส่ full_name, phone, address ก็ได้)
    public function register() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (username, email, password, full_name, phone, address, role) 
                 VALUES (:username, :email, :password, :full_name, :phone, :address, :role)";
        
        $stmt = $this->conn->prepare($query);

        // กำหนดค่าพารามิเตอร์
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindValue(':full_name', $this->full_name ?: null, PDO::PARAM_STR);
        $stmt->bindValue(':phone', $this->phone ?: null, PDO::PARAM_STR);
        $stmt->bindValue(':address', $this->address ?: null, PDO::PARAM_STR);
        $stmt->bindValue(':role', $this->role ?? 'USER'); 

        return $stmt->execute();
    }

    // ✅ ตรวจสอบว่าอีเมลซ้ำหรือไม่
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // ✅ ฟังก์ชันล็อกอิน (ดึง role, full_name, phone, address)
    public function login() {
        $query = "SELECT id, username, password, full_name, phone, address, role FROM " . $this->table_name . " WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];        
                $this->username = $row['username']; 
                $this->full_name = $row['full_name'] ?? null; 
                $this->phone = $row['phone'] ?? null; 
                $this->address = $row['address'] ?? null; 
                $this->role = $row['role'];    
                return true;
            }
        }
        return false; 
    }
}
?>
