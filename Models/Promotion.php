<?php
require_once 'Database.php';

class Promotion {
    private $conn;
    private $table_name = "promotions";

    public $id;
    public $title;
    public $description;
    public $image;
    public $created_at;

    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        "title" => "VARCHAR(100) NOT NULL",
        "description" => "TEXT",
        "image" => "VARCHAR(255)",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];

    public function __construct($db) {
        $this->conn = $db;

        // ✅ ใช้ TableManager เพื่อตรวจสอบและอัปเดตโครงสร้างตาราง
        $tableManager = new TableManager($this->conn);
        $tableManager->validateAndUpdateTableStructure($this->table_name, self::$schema);

        // ✅ Seed ข้อมูลโปรโมชั่น (ถ้ายังไม่มี)
        $this->seedPromotions();
    }

    private function seedPromotions() {
        // สร้าง object ของ PromotionSeeder และรันการเพิ่มข้อมูล
        require_once(__DIR__ . '/../Seeders/PromotionSeeder.php');
        $seeder = new PromotionSeeder($this->conn);
        $seeder->seed();
    }

    public function getAllPromotions() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            // เพิ่ม debug log
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Query result: " . print_r($result, true));
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (title, description, image) VALUES (:title, :description, :image)";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':image', $this->image);
        
        return $stmt->execute();
    }

    public function delete($id) {
        // ลบรูปภาพเก่า
        $query = "SELECT image FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && file_exists("../assets/images/" . $result['image'])) {
            unlink("../assets/images/" . $result['image']);
        }
        
        // ลบข้อมูลจากฐานข้อมูล
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?> 