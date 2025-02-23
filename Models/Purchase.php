<?php
require_once 'Database.php';
class Purchase {
    private $conn;
    private $table_name = "purchases";

    public $id;
    public $user_id;
    public $product_id;
    public $quantity;
    public $total_price;
    public $status;  // PENDING, PAID, CANCELLED
    public $payment_method;  // CASH, CREDIT_CARD, TRANSFER
    public $payment_status;  // PENDING, COMPLETED, FAILED
    public $payment_date;
    public $note;
    public $created_at;
    public $updated_at;

    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        "user_id" => "INT NOT NULL",
        "product_id" => "INT NOT NULL",
        "quantity" => "INT NOT NULL DEFAULT 1",
        "total_price" => "DECIMAL(10,2) NOT NULL",
        "status" => "ENUM('PENDING', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING'",
        "payment_method" => "ENUM('CASH', 'CREDIT_CARD', 'TRANSFER') DEFAULT NULL",
        "payment_status" => "ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING'",
        "payment_date" => "DATETIME DEFAULT NULL",
        "note" => "TEXT DEFAULT NULL",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "CONSTRAINT fk_purchase_user" => "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
        "CONSTRAINT fk_purchase_product" => "FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE"
    ];

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    SET user_id = :user_id,
                        product_id = :product_id,
                        quantity = :quantity,
                        total_price = :total_price,
                        status = :status,
                        payment_method = :payment_method,
                        payment_status = :payment_status,
                        note = :note";

            $stmt = $this->conn->prepare($query);

            // Sanitize
            $this->user_id = htmlspecialchars(strip_tags($this->user_id));
            $this->product_id = htmlspecialchars(strip_tags($this->product_id));
            $this->quantity = htmlspecialchars(strip_tags($this->quantity));
            $this->total_price = htmlspecialchars(strip_tags($this->total_price));
            $this->status = htmlspecialchars(strip_tags($this->status));
            $this->payment_method = htmlspecialchars(strip_tags($this->payment_method));
            $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
            $this->note = htmlspecialchars(strip_tags($this->note ?? ''));

            // Bind values
            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity", $this->quantity);
            $stmt->bindParam(":total_price", $this->total_price);
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":payment_method", $this->payment_method);
            $stmt->bindParam(":payment_status", $this->payment_status);
            $stmt->bindParam(":note", $this->note);

            if($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch(PDOException $e) {
            error_log("Error creating purchase: " . $e->getMessage());
            return false;
        }
    }

    public function update() {
        try {
            $query = "UPDATE " . $this->table_name . "
                    SET status = :status,
                        payment_method = :payment_method,
                        payment_status = :payment_status,
                        payment_date = :payment_date,
                        note = :note,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Sanitize
            $this->status = htmlspecialchars(strip_tags($this->status));
            $this->payment_method = htmlspecialchars(strip_tags($this->payment_method));
            $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
            $this->payment_date = $this->payment_status === 'COMPLETED' ? date('Y-m-d H:i:s') : null;
            $this->note = htmlspecialchars(strip_tags($this->note ?? ''));
            $this->id = htmlspecialchars(strip_tags($this->id));

            // Bind values
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":payment_method", $this->payment_method);
            $stmt->bindParam(":payment_status", $this->payment_status);
            $stmt->bindParam(":payment_date", $this->payment_date);
            $stmt->bindParam(":note", $this->note);
            $stmt->bindParam(":id", $this->id);

            return $stmt->execute();
        } catch(PDOException $e) {
            error_log("Error updating purchase: " . $e->getMessage());
            return false;
        }
    }

    public function delete() {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $this->id = htmlspecialchars(strip_tags($this->id));
            $stmt->bindParam(":id", $this->id);

            return $stmt->execute();
        } catch(PDOException $e) {
            error_log("Error deleting purchase: " . $e->getMessage());
            return false;
        }
    }

    public function getUserPurchases($user_id) {
        try {
            $query = "SELECT p.*, 
                             pr.name as product_name, pr.image as product_image, pr.price as product_price, pr.type as product_type
                      FROM " . $this->table_name . " p
                      JOIN products pr ON p.product_id = pr.id
                      WHERE p.user_id = :user_id
                      ORDER BY p.created_at DESC";
    
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user purchases: " . $e->getMessage());
            return false;
        }
    }

    public function getAll() {
        try {
            $query = "SELECT p.*, 
                             pr.name AS product_name, pr.image AS product_image, pr.price AS product_price, pr.type AS product_type,
                             u.username AS user_username, u.email AS user_email, u.full_name, u.phone
                      FROM " . $this->table_name . " p
                      LEFT JOIN products pr ON p.product_id = pr.id
                      LEFT JOIN users u ON p.user_id = u.id
                      ORDER BY p.created_at DESC";
    
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting all purchases: " . $e->getMessage());
            return [];
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT p.*, pr.name as product_name, pr.image as product_image,
                            pr.price as product_price, pr.type as product_type,
                            u.username as user_username, u.email as user_email,
                            u.first_name, u.last_name, u.phone
                     FROM " . $this->table_name . " p
                     JOIN products pr ON p.product_id = pr.id
                     JOIN users u ON p.user_id = u.id
                     WHERE p.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting purchase by ID: " . $e->getMessage());
            return false;
        }
    }
}
?> 