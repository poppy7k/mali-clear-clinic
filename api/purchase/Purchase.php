<?php
header("Content-Type: application/json");
require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/Purchase.php');

try {
    $database = new Database();
    $db = $database->getConnection();
    $purchase = new Purchase($db);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        
        if ($user_id) {
            // 📌 ค้นหาข้อมูลจาก user_id
            $result = $purchase->getUserPurchases($user_id);
        } else {
            // 📌 ดึงข้อมูลทั้งหมด
            $result = $purchase->getAll();
        }

        if ($result) {
            echo json_encode([
                "status" => "success",
                "data" => $result
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "ไม่พบข้อมูล"
            ]);
        }
        exit;
    }

} catch (PDOException $e) {
    error_log($e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "เกิดข้อผิดพลาดกับฐานข้อมูล",
        "error_code" => "DB_ERROR"
    ]);
    exit;
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "เกิดข้อผิดพลาดที่ไม่คาดคิด",
        "error_code" => "GENERAL_ERROR"
    ]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Method ไม่ถูกต้อง"]);

?> 