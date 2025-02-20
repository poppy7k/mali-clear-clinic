<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(__DIR__ . '/../Models/Database.php');
require_once(__DIR__ . '/../Models/Promotion.php');

// สร้างการเชื่อมต่อกับฐานข้อมูล
$database = new Database();
$db = $database->getConnection();
$promotion = new Promotion($db);

// ตรวจสอบ HTTP Method
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $promotions = $promotion->getAllPromotions();
        echo json_encode([
            "status" => "success",
            "data" => $promotions
        ]);
        exit;
    }

    // ตรวจสอบสิทธิ์ ADMIN สำหรับ POST, PUT, DELETE
    session_start();
    if (!isset($_SESSION['userRole']) || $_SESSION['userRole'] !== 'ADMIN') {
        throw new Exception("Unauthorized access");
    }

    if ($method === 'POST') {
        // จัดการอัพโหลดรูปภาพ
        if (!isset($_FILES['image'])) {
            throw new Exception("No image file uploaded");
        }

        $image = $_FILES['image'];
        $imageName = time() . '_' . $image['name'];
        $targetPath = __DIR__ . '/../../assets/images/' . $imageName;
        
        if (move_uploaded_file($image['tmp_name'], $targetPath)) {
            $promotion->title = $_POST['title'];
            $promotion->description = $_POST['description'];
            $promotion->image = $imageName;
            
            if ($promotion->create()) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Promotion created successfully"
                ]);
            } else {
                throw new Exception("Failed to create promotion");
            }
        } else {
            throw new Exception("Failed to upload image");
        }
        exit;
    }

    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            throw new Exception("Missing promotion ID");
        }

        $id = $_GET['id'];
        if ($promotion->delete($id)) {
            echo json_encode([
                "status" => "success", 
                "message" => "Promotion deleted successfully"
            ]);
        } else {
            throw new Exception("Failed to delete promotion");
        }
        exit;
    }

    // ถ้าไม่ได้รับ method ที่ถูกต้อง
    throw new Exception("Invalid request method");

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 