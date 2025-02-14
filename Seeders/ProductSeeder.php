<?php
require_once(__DIR__ . '/../Models/Database.php');
require_once(__DIR__ . '/../Models/Product.php');

class ProductSeeder {
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
            ['category_id' => 1, 'name' => 'Facial Treatment', 'price' => 1500.00, 'image' => 'facial.jpg', 'description' => 'A refreshing facial treatment.'],
            ['category_id' => 1, 'name' => 'Acne Care', 'price' => 1800.00, 'image' => 'acne_care.jpg', 'description' => 'Specialized treatment for acne-prone skin.'],
            ['category_id' => 2, 'name' => 'Moisturizing Cream', 'price' => 1200.00, 'image' => 'moisturizer.jpg', 'description' => 'Hydrating cream for all skin types.']
        ];

        // เพิ่มข้อมูลลงตาราง
        $query = "INSERT INTO products (category_id, name, price, image, description) VALUES (:category_id, :name, :price, :image, :description)";
        $stmt = $this->db->prepare($query);

        foreach ($sampleProducts as $item) {
            $stmt->execute([
                ':category_id' => $item['category_id'],
                ':name' => $item['name'],
                ':price' => $item['price'],
                ':image' => $item['image'],
                ':description' => $item['description']
            ]);
        }
    }
}
?>
