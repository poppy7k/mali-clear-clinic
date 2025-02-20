<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../Models/Database.php';
require_once '../Models/Promotion.php';

$database = new Database();
$db = $database->getConnection();
$promotion = new Promotion($db);
$method = $_SERVER['REQUEST_METHOD'];

// ตรวจสอบสิทธิ์ ADMIN สำหรับ POST และ DELETE
if (($method === 'POST' || $method === 'DELETE') && !isset($_SESSION['userRole']) || $_SESSION['userRole'] !== 'ADMIN') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

if ($method === 'GET') {
    try {
        $promotions = $promotion->getAllPromotions();
        echo json_encode([
            "status" => "success",
            "data" => $promotions
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
} elseif ($method === 'POST') {
    try {
        // จัดการอัพโหลดรูปภาพ
        $image = $_FILES['image'];
        $imageName = time() . '_' . $image['name'];
        $targetPath = '../assets/images/' . $imageName;
        
        if (move_uploaded_file($image['tmp_name'], $targetPath)) {
            $promotion->title = $_POST['title'];
            $promotion->description = $_POST['description'];
            $promotion->image = $imageName;
            
            if ($promotion->create()) {
                echo json_encode(["status" => "success", "message" => "Promotion created successfully"]);
            } else {
                throw new Exception("Failed to create promotion");
            }
        } else {
            throw new Exception("Failed to upload image");
        }
    } catch (Exception $e) {
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
} elseif ($method === 'DELETE') {
    try {
        $id = $_GET['id'];
        if ($promotion->delete($id)) {
            echo json_encode(["status" => "success", "message" => "Promotion deleted successfully"]);
        } else {
            throw new Exception("Failed to delete promotion");
        }
    } catch (Exception $e) {
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}

exit;
?> 