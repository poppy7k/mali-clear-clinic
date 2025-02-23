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

if ($method === 'GET') {
    $promotion_id = isset($_GET['id']) ? $_GET['id'] : null;

    if ($promotion_id) {
        $promotion_data = $promotion->getPromotionById($promotion_id);
        echo json_encode(["status" => $promotion_data ? "success" : "error", "data" => $promotion_data ?: "ไม่มีข้อมูล"]);
        exit;
    }

    $promotions = $promotion->getAllPromotions();
    echo json_encode(["status" => $promotions ? "success" : "error", "data" => $promotions ?: "ไม่มีข้อมูล"]);
    exit;
}

if ($method === 'POST') {
    try {
        error_log("Received POST data: " . print_r($_POST, true));
        error_log("Received FILES: " . print_r($_FILES, true));

        if (!isset($_POST['title']) || !isset($_POST['description']) || empty($_POST['title']) || empty($_POST['description'])) {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            exit;
        }

        $promotion->title = $_POST['title'];
        $promotion->description = $_POST['description'];

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $image = $_FILES['image'];
            $image_name = time() . '-' . basename($image['name']);
            $target_path = "../../assets/images/promotions/" . $image_name;

            if (move_uploaded_file($image['tmp_name'], $target_path)) {
                $promotion->image = $image_name;
            } else {
                error_log("Failed to move uploaded file");
                echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
                exit;
            }
        }

        if ($promotion->create()) {
            echo json_encode(["status" => "success", "message" => "Promotion created successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create promotion"]);
        }

    } catch (Exception $e) {
        error_log("Error creating promotion: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    }
    exit;
}


if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Missing promotion ID"]);
        exit;
    }

    if ($promotion->delete($data['id'])) {
        echo json_encode(["status" => "success", "message" => "Promotion deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete promotion"]);
    }
    exit;
}

if ($method === 'PATCH') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id']) || !isset($data['status'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // อัปเดตเฉพาะสถานะ
    $query = "UPDATE products SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        ':id' => $data['id'],
        ':status' => $data['status']
    ])) {
        echo json_encode(["status" => "success", "message" => "Product status updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update product status"]);
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
exit;
?> 