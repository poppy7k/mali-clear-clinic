<?php
header("Content-Type: application/json");
require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/Purchase.php');

try {
    $database = new Database();
    $db = $database->getConnection();
    $purchase = new Purchase($db);

    $method = $_SERVER['REQUEST_METHOD'];

    // ✅ ดึงข้อมูล (GET)
    if ($method === 'GET') {
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        
        if ($user_id) {
            $result = $purchase->getUserPurchases($user_id);
        } else {
            $result = $purchase->getAll();
        }

        echo json_encode([
            "status" => $result ? "success" : "error",
            "data" => $result ?: [],
            "message" => $result ? "" : "ไม่พบข้อมูล"
        ]);
        exit;
    }

    // ✅ เพิ่มข้อมูลการสั่งซื้อ (POST)
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id'], $data['product_id'], $data['quantity'], $data['total_price'])) {
            echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
            exit;
        }

        $purchase->user_id = $data['user_id'];
        $purchase->product_id = $data['product_id'];
        $purchase->quantity = $data['quantity'];
        $purchase->total_price = $data['total_price'];
        $purchase->status = 'PENDING';
        $purchase->payment_status = 'PENDING';

        if ($purchase->create()) {
            echo json_encode(["status" => "success", "message" => "สร้างคำสั่งซื้อสำเร็จ"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่สามารถสร้างคำสั่งซื้อได้"]);
        }
        exit;
    }

} catch (PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาดกับฐานข้อมูล", "error_code" => "DB_ERROR"]);
    exit;
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาดที่ไม่คาดคิด", "error_code" => "GENERAL_ERROR"]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Method ไม่ถูกต้อง"]);
exit;
?>
