<?php
class PurchasesSeeder {
    private $conn;
    private $table_name = "purchases";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function seed() {
        try {
            // เช็คว่ามี users และ products อยู่ในระบบหรือไม่
            $userQuery = "SELECT id FROM users LIMIT 1";
            $productQuery = "SELECT id FROM products LIMIT 1";
            
            $userStmt = $this->conn->query($userQuery);
            $productStmt = $this->conn->query($productQuery);
            
            $userId = $userStmt->fetch(PDO::FETCH_ASSOC)['id'] ?? null;
            $productId = $productStmt->fetch(PDO::FETCH_ASSOC)['id'] ?? null;

            if (!$userId || !$productId) {
                echo "⚠️ Please seed users and products first.\n";
                return;
            }

            // ข้อมูลตัวอย่าง
            $purchases = [
                [
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => 2,
                    'total_price' => 1000.00,
                    'status' => 'PAID',
                    'payment_method' => 'CREDIT_CARD',
                    'payment_status' => 'COMPLETED',
                    'payment_date' => date('Y-m-d H:i:s'),
                    'note' => 'ตัวอย่างการซื้อสินค้าที่ชำระเงินแล้ว'
                ],
                [
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => 1,
                    'total_price' => 500.00,
                    'status' => 'PENDING',
                    'payment_method' => 'TRANSFER',
                    'payment_status' => 'PENDING',
                    'payment_date' => null,
                    'note' => 'ตัวอย่างการซื้อสินค้าที่รอชำระเงิน'
                ],
                [
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => 1,
                    'total_price' => 750.00,
                    'status' => 'CANCELLED',
                    'payment_method' => null,
                    'payment_status' => 'FAILED',
                    'payment_date' => null,
                    'note' => 'ตัวอย่างการซื้อสินค้าที่ยกเลิก'
                ]
            ];

            // เพิ่มข้อมูล
            foreach ($purchases as $purchase) {
                $query = "INSERT INTO " . $this->table_name . "
                        SET user_id = :user_id,
                            product_id = :product_id,
                            quantity = :quantity,
                            total_price = :total_price,
                            status = :status,
                            payment_method = :payment_method,
                            payment_status = :payment_status,
                            payment_date = :payment_date,
                            note = :note";

                $stmt = $this->conn->prepare($query);

                // Bind values
                foreach ($purchase as $key => $value) {
                    $stmt->bindValue(":" . $key, $value);
                }

                $stmt->execute();
            }

            echo "✅ Purchases seeded successfully!\n";
            return true;
        } catch(PDOException $e) {
            echo "❌ Error seeding purchases: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public function clear() {
        try {
            $query = "TRUNCATE TABLE " . $this->table_name;
            $this->conn->exec($query);
            echo "✅ Purchases table cleared successfully!\n";
            return true;
        } catch(PDOException $e) {
            echo "❌ Error clearing purchases table: " . $e->getMessage() . "\n";
            return false;
        }
    }
}
?>