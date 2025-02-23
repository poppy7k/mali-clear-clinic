<?php
require_once 'Database.php';
require_once(__DIR__ . '/../Seeders/ProductsSeeder.php');

class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $category_id;
    public $name;
    public $price;
    public $description;
    public $image;
    public $type;
    public $status;
    public $created_at;

    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        "category_id" => "INT NOT NULL",
        "name" => "VARCHAR(100) NOT NULL",
        "price" => "DECIMAL(10,2) NOT NULL",
        "image" => "VARCHAR(255)",
        "description" => "TEXT",
        "type" => "ENUM('PRODUCT', 'SERVICE') NOT NULL",
        "status" => "ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "CONSTRAINT fk_products_category" => "FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE"
    ];
    

    public function __construct($db) {
        $this->conn = $db;

        // ✅ ใช้ TableManager เพื่อตรวจสอบและอัปเดตโครงสร้างตาราง
        $tableManager = new TableManager($this->conn);
        $tableManager->validateAndUpdateTableStructure($this->table_name, self::$schema);

    }

    // เพิ่มสินค้าใหม่ (สำหรับ POST)
    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                     (category_id, name, price, description, image, type, status) 
                     VALUES 
                     (:category_id, :name, :price, :description, :image, :type, :status)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':category_id', $this->category_id);
            $stmt->bindParam(':name', $this->name);
            $stmt->bindParam(':price', $this->price);
            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':image', $this->image);
            $stmt->bindParam(':type', $this->type);
            $stmt->bindParam(':status', $this->status);
    
            if ($stmt->execute()) {
                return true;
            } else {
                error_log("❌ Error creating product: " . print_r($stmt->errorInfo(), true));
                return false;
            }
        } catch (PDOException $e) {
            error_log("❌ Exception: " . $e->getMessage());
            return false;
        }
    }    

    public function getAllProducts() {
        $query = "SELECT p.*, c.name as category_name 
                 FROM " . $this->table_name . " p 
                 LEFT JOIN categories c ON p.category_id = c.id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return count($products) > 0 ? $products : null;
    }
    
    public function getProductsByType($type) {
        $query = "SELECT p.*, c.name as category_name 
                 FROM " . $this->table_name . " p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.type = :type";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":type", $type);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        return count($products) > 0 ? $products : null;
    }
    
    public function getProductsByCategory($category_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE category_id = :category_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":category_id", $category_id);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        return count($products) > 0 ? $products : null;
    }
    
    public function getProductsByTypeAndCategory($type, $category_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE type = :type AND category_id = :category_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":type", $type);
        $stmt->bindParam(":category_id", $category_id);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        return count($products) > 0 ? $products : null;
    }
    
    public function getProductById($product_id) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE p.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$product_id]);
        
        return $stmt->rowCount() > 0 ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
    }
    
    public function getProductImage($id) {
        try {
            $query = "SELECT image FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['image'] : null;
        } catch (PDOException $e) {
            error_log("Error getting product image: " . $e->getMessage());
            return null;
        }
    }

    // อัปเดตข้อมูลสินค้า (สำหรับ PUT)
    public function update() {
        try {
            $query = "UPDATE " . $this->table_name . " 
                     SET name = :name, 
                         category_id = :category_id, 
                         price = :price, 
                         description = :description, 
                         type = :type,
                         status = :status";

            // เพิ่ม image เข้าไปในคำสั่ง SQL เฉพาะเมื่อมีการอัปเดตรูปภาพ
            if (!empty($this->image)) {
                $query .= ", image = :image";
            }

            $query .= " WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':name', $this->name);
            $stmt->bindParam(':category_id', $this->category_id);
            $stmt->bindParam(':price', $this->price);
            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':type', $this->type);
            $stmt->bindParam(':status', $this->status);

            // Bind image parameter เฉพาะเมื่อมีการอัปเดตรูปภาพ
            if (!empty($this->image)) {
                $stmt->bindParam(':image', $this->image);
            }

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error updating product: " . $e->getMessage());
            return false;
        }
    }

    // ลบสินค้า (สำหรับ DELETE)
    public function delete() {
        // ลบรูปภาพเก่า (ถ้ามี)
        $query = "SELECT image FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && !empty($result['image'])) {
            $image_path = $_SERVER['DOCUMENT_ROOT'] . "/mali-clear-clinic/assets/images/" . $result['image'];
            if (file_exists($image_path)) {
                unlink($image_path);
            }
        }

        // ลบข้อมูลจากฐานข้อมูล
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        return $stmt->execute();
    }
}
?>
