<?php
session_start();
header('Content-Type: application/json');

require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/User.php');

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "status" => "error",
            "message" => "กรุณาเข้าสู่ระบบ"
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // ดึงข้อมูลผู้ใช้จาก ID ใน session
    $userData = $user->getById($_SESSION['user_id']);
    
    if ($userData) {
        // ลบข้อมูลที่ไม่ต้องการส่งไปยัง client
        unset($userData['password']);
        
        echo json_encode([
            "status" => "success",
            "data" => $userData
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "ไม่พบข้อมูลผู้ใช้"
        ]);
    }

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "เกิดข้อผิดพลาดในการดึงข้อมูล"
    ]);
}
?> 