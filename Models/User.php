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
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];

    public function __construct($db) {
        $this->conn = $db;
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

    public function updateProfile() {
        try {
            $query = "UPDATE " . $this->table_name . "
                     SET full_name = :full_name,
                         phone = :phone,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // ทำความสะอาดข้อมูล
            $this->full_name = htmlspecialchars(strip_tags(trim($this->full_name)));
            $this->phone = $this->phone ? htmlspecialchars(strip_tags(trim($this->phone))) : null;

            // bind parameters
            $stmt->bindParam(":full_name", $this->full_name);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":id", $this->id);

            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch(PDOException $e) {
            error_log("Error updating user profile: " . $e->getMessage());
            return false;
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT id, username, email, full_name, phone, address, role, created_at, updated_at 
                     FROM " . $this->table_name . " 
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                // แปลงค่า null เป็นสตริงว่าง
                $result['full_name'] = $result['full_name'] ?? '';
                $result['phone'] = $result['phone'] ?? '';
                $result['address'] = $result['address'] ?? '';
            }

            return $result;
        } catch(PDOException $e) {
            error_log("Error getting user by ID: " . $e->getMessage());
            return false;
        }
    }
}
?>
