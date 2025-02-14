<?php
require_once 'Database.php';
require_once(__DIR__ . '/../Seeders/ProductSeeder.php');

class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $category_id;
    public $name;
    public $price;
    public $description;
    public $image;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createTableIfNotExists() {
        $query = "
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            image VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $this->seedProducts();
    }

    private function seedProducts() {
        // สร้าง object ของ ProductSeeder และรันการเพิ่มข้อมูล
        $seeder = new ProductSeeder($this->conn);
        $seeder->seed();
    }

    // เพิ่มสินค้าใหม่ (สำหรับ POST)
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (category_id, name, price, description, image) 
                  VALUES (:category_id, :name, :price, :description, :image)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':category_id', $this->category_id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':image', $this->image);

        return $stmt->execute();
    }

    // ดึงสินค้าตาม Category (สำหรับ GET)
    public function getProductsByCategory($category_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE category_id = :category_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":category_id", $category_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ดึงสินค้าทั้งหมด (สำหรับ GET)
    public function getAllProducts() {
        $query = "SELECT id, name, description, image FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $products[] = $row;
        }

        return $products;
    }

    // อัปเดตข้อมูลสินค้า (สำหรับ PUT)
    public function update() {
        $query = "UPDATE " . $this->table_name . " SET name = :name, category_id = :category_id, 
                  price = :price, description = :description, image = :image WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':category_id', $this->category_id);
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':image', $this->image);

        return $stmt->execute();
    }

    // ลบสินค้า (สำหรับ DELETE)
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $this->id);

        return $stmt->execute();
    }
}
?>
