<?php
require_once 'Database.php';
require_once 'TableManager.php';
require_once(__DIR__ . '/../Seeders/CategorySeeder.php');

class Category {
    private $conn;
    private $table_name = "categories";
    public $id;
    public $name;
    public $created_at;

    // ✅ กำหนด Schema ของตาราง `categories`
    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        "name" => "VARCHAR(100) NOT NULL UNIQUE",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];

    public function __construct($db) {
        $this->conn = $db;

        // ✅ ใช้ TableManager เพื่อตรวจสอบและอัปเดตโครงสร้างตาราง
        $tableManager = new TableManager($this->conn);
        $tableManager->validateAndUpdateTableStructure($this->table_name, self::$schema);

        // ✅ Seed ข้อมูลหมวดหมู่ (ถ้ายังไม่มี)
        $this->seedCategories();
    }

    private function seedCategories() {
        $seeder = new CategorySeeder($this->conn);
        $seeder->run();
    }

    // ✅ เพิ่ม Category ใหม่
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (name) VALUES (:name)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $this->name);
        return $stmt->execute();
    }

    // ✅ ดึงข้อมูล Category ทั้งหมด
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
