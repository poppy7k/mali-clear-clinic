<?php
require_once(__DIR__ . '/../Models/Database.php');
require_once(__DIR__ . '/../Models/Product.php');

class ProductsSeeder {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function seed() {
        $product = new Product($this->db);
        
        // ตรวจสอบว่าตารางมีข้อมูลอยู่แล้วหรือไม่
        $query = "SELECT COUNT(*) as count FROM products";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            return;
        }

        // ข้อมูลตัวอย่าง
        $sampleProducts = [
            [
                'category_id' => 1,
                'name' => 'Facial Treatment',
                'price' => 1500.00,
                'image' => 'facial.jpg',
                'description' => 'A refreshing facial treatment',
                'type' => 'SERVICE'
            ],
            [
                'category_id' => 2,
                'name' => 'Moisturizing Cream',
                'price' => 1200.00,
                'image' => 'moisturizer.jpg',
                'description' => 'Hydrating cream for all skin types',
                'type' => 'PRODUCT'
            ]
        ];

        // เพิ่มข้อมูลลงตาราง
        $query = "INSERT INTO products (category_id, name, price, image, description, type) 
                  VALUES (:category_id, :name, :price, :image, :description, :type)";
        $stmt = $this->db->prepare($query);

        foreach ($sampleProducts as $item) {
            $stmt->execute($item);
        }
    }
}
?>
