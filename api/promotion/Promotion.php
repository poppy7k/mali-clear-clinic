<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/Promotion.php');

$database = new Database();
$db = $database->getConnection();
$promotion = new Promotion($db);

$method = $_SERVER['REQUEST_METHOD'];

// ✅ ตรวจสอบถ้ามี `_method=PUT` ให้เปลี่ยน `$method` เป็น `PUT`
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

// ✅ สร้างโปรโมชั่นใหม่
if ($method === 'POST') {
    if (!isset($_FILES['image'], $_POST['title'], $_POST['description'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $image = $_FILES['image'];
    $imageName = time() . '_' . basename($image['name']);
    $targetPath = __DIR__ . '/../../assets/images/' . $imageName;

    if (move_uploaded_file($image['tmp_name'], $targetPath)) {
        $promotion->title = $_POST['title'];
        $promotion->description = $_POST['description'];
        $promotion->image = $imageName;

        if ($promotion->create()) {
            echo json_encode(["status" => "success", "message" => "Promotion created successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create promotion"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
    }
    exit;
}

// ✅ อัปเดตโปรโมชั่น (PUT)
if ($method === 'PUT') {
    $id = $_POST['id'] ?? null;
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? null;

    if (!$id || !$title || !$description) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // ✅ อัปเดตรูปภาพถ้ามีอัปโหลดใหม่
    if (!empty($_FILES['image']['name'])) {
        $image = $_FILES['image'];
        $imageName = time() . '_' . basename($image['name']);
        $targetPath = __DIR__ . '/../../assets/images/' . $imageName;
        
        if (move_uploaded_file($image['tmp_name'], $targetPath)) {
            $stmt = $db->prepare("UPDATE promotions SET title = ?, description = ?, image = ? WHERE id = ?");
            $updateSuccess = $stmt->execute([$title, $description, $imageName, $id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
            exit;
        }
    } else {
        $stmt = $db->prepare("UPDATE promotions SET title = ?, description = ? WHERE id = ?");
        $updateSuccess = $stmt->execute([$title, $description, $id]);
    }

    if ($updateSuccess) {
        echo json_encode(["status" => "success", "message" => "Promotion updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update promotion"]);
    }
    exit;
}

// ✅ ลบโปรโมชั่น
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(["status" => "error", "message" => "Missing promotion ID"]);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM promotions WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(["status" => "success", "message" => "Promotion deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete promotion"]);
    }
    exit;
}

if ($method === 'GET') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if ($id) {
        // ดึงข้อมูลโปรโมชั่นตาม ID
        $sql = "SELECT * FROM promotions WHERE id = ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($promotion) {
            // เพิ่ม items เป็น array ว่าง (สำหรับรองรับโครงสร้างข้อมูลในอนาคต)
            $promotion['items'] = [];
            
            echo json_encode(["status" => "success", "data" => $promotion]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบโปรโมชั่นที่ต้องการ"]);
        }
        exit;
    }
    
    // ถ้าไม่มี ID ให้ดึงข้อมูลทั้งหมดตามเดิม
    $sql = "SELECT * FROM promotions";
    $result = $db->query($sql);
    
    $promotions = [];
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $promotions[] = $row;
    }
    
    echo json_encode(["status" => "success", "data" => $promotions]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
?>