<?php
require_once(__DIR__ . '/../Models/Database.php');

class PromotionSeeder {
    private $conn;
    private $table_name = "promotions";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function seed() {
        // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            return;
        }

        // ข้อมูลตัวอย่างสำหรับโปรโมชั่น
        $promotions = [
            [
                'title' => 'โปรโมชั่น ต้อนรับวาเลนไทน์',
                'description' => 'รักษาสิว หายใจใหม่ ด้วยโปรแกรมทรีทเม้นท์ที่ทันสมัย',
                'image' => 'Pic1.png'
            ],
            [
                'title' => 'โปรโมชั่น คริสต์มาส',
                'description' => 'บำรุงผิว ให้ผิวขาวใส และกระจ่างใส',
                'image' => 'Pic1.png'
            ],
            [
                'title' => 'โปรโมชั่น ส่งท้ายปีเก่าต้อนรับปีใหม่',
                'description' => 'บำรุงร่างกาย ให้ผิวเรียบเนียน และกระชับ',
                'image' => 'Pic1.png'
            ]
        ];

        // เพิ่มข้อมูลลงในฐานข้อมูล
        $query = "INSERT INTO " . $this->table_name . " (title, description, image) VALUES (:title, :description, :image)";
        $stmt = $this->conn->prepare($query);

        foreach ($promotions as $promotion) {
            $stmt->execute([
                ':title' => $promotion['title'],
                ':description' => $promotion['description'],
                ':image' => $promotion['image']
            ]);
        }
    }
}
?> 