<?php
require_once 'Database.php';
require_once(__DIR__ . '/../Seeders/CategorySeeder.php');


class Category {
    private $conn;
    private $table_name = "categories";

    public $id;
    public $name;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createTableIfNotExists() {
        $query = "
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $this->seedCategories();
    }

    private function seedCategories() {
        // สร้าง object ของ CategorySeeder และรันการเพิ่มข้อมูล
        $seeder = new CategorySeeder($this->conn);
        $seeder->run();
    }

    // เพิ่ม Category ใหม่
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (name) VALUES (:name)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $this->name);

        return $stmt->execute();
    }

    // ดึงข้อมูล Category ทั้งหมด
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
