<?php
header("Content-Type: application/json");

// แสดง error ชัดเจน (เฉพาะตอน debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/Category.php');

// สร้างการเชื่อมต่อกับฐานข้อมูล
$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

// ตรวจสอบ HTTP Method
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // ตรวจสอบว่ามีข้อมูลชื่อ category หรือไม่
        if (!isset($data['name'])) {
            throw new Exception("Missing required field: name");
        }

        $category->name = $data['name'];

        // สร้าง category ใหม่
        if ($category->create()) {
            echo json_encode(["status" => "success", "message" => "Category created successfully"]);
        } else {
            throw new Exception("Failed to create category");
        }
        exit;
    }

    if ($method === 'GET') {
        if (isset($_GET["id"])) {
            $category_id = $_GET["id"];
            $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$category_id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $categories = $category->getAllCategories();
            if ($categories) {
                echo json_encode(["status" => "success", "data" => $categories]);
            } else {
                echo json_encode(["status" => "error", "message" => "No categories found"]);
            }
        }
        exit;
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // ตรวจสอบว่ามีข้อมูล id และ name หรือไม่
        if (!isset($data['id'], $data['name'])) {
            throw new Exception("Missing fields");
        }

        $stmt = $db->prepare("UPDATE categories SET name = ? WHERE id = ?");
        if ($stmt->execute([$data['name'], $data['id']])) {
            echo json_encode(["status" => "success", "message" => "Category updated successfully"]);
        } else {
            throw new Exception("Failed to update category");
        }
        exit;
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // ตรวจสอบว่ามี id ของ category หรือไม่
        if (!isset($data['id'])) {
            throw new Exception("Missing category ID");
        }

        $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
        if ($stmt->execute([$data['id']])) {
            echo json_encode(["status" => "success", "message" => "Category deleted successfully"]);
        } else {
            throw new Exception("Failed to delete category");
        }
        exit;
    }

    // ถ้าไม่ได้รับ method ที่ถูกต้อง
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
} catch (Exception $e) {
    // ถ้ามีข้อผิดพลาดจะส่งออกข้อความ error
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
