<?php

require_once 'Database.php';

class Blog {
    private $conn;
    private $table_name = "blogs";

    public $id;
    public $title;
    public $content;
    public $excerpt;
    public $image;
    public $status;
    public $created_at;
    public $updated_at;

    public static $schema = [
        "id" => "INT AUTO_INCREMENT PRIMARY KEY",
        'title' => 'VARCHAR(255)',
        'content' => 'TEXT',
        'excerpt' => 'VARCHAR(255)',
        'image' => 'VARCHAR(255)',
        'status' => 'ENUM("draft", "published")',
        'created_at' => 'DATETIME',
        'updated_at' => 'DATETIME'
    ];

    public function __construct($db) {
        $this->conn = $db;
    }

    // สร้างบล็อกใหม่
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, content=:content, excerpt=:excerpt, image=:image, status=:status, created_at=NOW(), updated_at=NOW()";

        $stmt = $this->conn->prepare($query);

        // ทำความสะอาดข้อมูล
        $this->title = htmlspecialchars(strip_tags($this->title ?? ''));
        $this->content = htmlspecialchars(strip_tags($this->content ?? ''));
        $this->excerpt = htmlspecialchars(strip_tags($this->excerpt ?? ''));
        $this->image = htmlspecialchars(strip_tags($this->image ?? ''));
        $this->status = htmlspecialchars(strip_tags($this->status ?? ''));
        // bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":content", $this->content);
        $stmt->bindParam(":excerpt", $this->excerpt);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":status", $this->status);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // ดึงบล็อกทั้งหมด
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // ดึงบล็อกตาม ID
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->id = $row['id'];
            $this->title = $row['title'];
            $this->content = $row['content'];
            $this->excerpt = $row['excerpt'];
            $this->image = $row['image'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    // อัปเดตบล็อก
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET title = :title, content = :content, excerpt = :excerpt, image = :image, status = :status, updated_at = NOW() 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // ทำความสะอาดข้อมูล
        $this->title = htmlspecialchars(strip_tags($this->title ?? ''));
        $this->content = htmlspecialchars(strip_tags($this->content ?? ''));
        $this->excerpt = htmlspecialchars(strip_tags($this->excerpt ?? ''));
        $this->image = htmlspecialchars(strip_tags($this->image ?? ''));
        $this->status = htmlspecialchars(strip_tags($this->status ?? ''));

        // bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":content", $this->content);
        $stmt->bindParam(":excerpt", $this->excerpt);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // ดึงรูปภาพของบล็อกจาก ID
    public function getImage($id) {
        $query = "SELECT image FROM " . $this->table_name . " WHERE id = ? LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $row['image'] : null;
    }


    // ลบบล็อก
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>
