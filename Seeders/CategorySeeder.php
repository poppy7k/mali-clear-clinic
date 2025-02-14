<?php
require_once(__DIR__ . '/../Models/Database.php');


class CategorySeeder {
    private $conn;
    private $table_name = "categories";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function run() {
        $this->seedCategories();
    }

    private function seedCategories() {
        // ตรวจสอบข้อมูลที่มีอยู่ในตาราง categories
        $query = "SELECT COUNT(*) FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $count = $stmt->fetchColumn();

        // ถ้าตารางยังไม่มีข้อมูล ให้เพิ่มข้อมูลตัวอย่าง
        if ($count == 0) {
            $query = "INSERT INTO " . $this->table_name . " (name) VALUES
                ('แฟต'),
                ('ฟิลเลอร์'),
                ('ฉีดหน้าใส')";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
        }
    }
}
?>
