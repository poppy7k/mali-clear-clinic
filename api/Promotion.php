<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(__DIR__ . '/../Models/Database.php');
require_once(__DIR__ . '/../Models/Promotion.php');

$database = new Database();
$db = $database->getConnection();
$promotion = new Promotion($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    if (!isset($_FILES['image'], $_POST['title'], $_POST['description'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $image = $_FILES['image'];
    $imageName = time() . '_' . $image['name'];
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

if ($method === 'GET') {
    if (isset($_GET["id"])) {
        $promotion_id = $_GET["id"];
        $stmt = $db->prepare("SELECT * FROM promotions WHERE id = ?");
        $stmt->execute([$promotion_id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        $promotions = $promotion->getAllPromotions();
        echo json_encode(["status" => "success", "data" => $promotions]);
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'], $data['title'], $data['description'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $db->prepare("UPDATE promotions SET title = ?, description = ? WHERE id = ?");
    if ($stmt->execute([$data['title'], $data['description'], $data['id']])) {
        echo json_encode(["status" => "success", "message" => "Promotion updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update promotion"]);
    }
    exit;
}

if ($method === 'DELETE') {
    // รองรับ id ทั้งจาก query string และ JSON body
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
    }

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

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
?>