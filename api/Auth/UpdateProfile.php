<?php
session_start();
header('Content-Type: application/json');

require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/User.php');

try {
    // ตรวจสอบว่ามีการล็อกอินหรือไม่
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "status" => "error",
            "message" => "กรุณาเข้าสู่ระบบ"
        ]);
        exit;
    }

    // รับข้อมูล JSON จาก request
    $data = json_decode(file_get_contents("php://input"), true);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['full_name']) || empty(trim($data['full_name']))) {
        echo json_encode([
            "status" => "error",
            "message" => "กรุณากรอกชื่อ-นามสกุล"
        ]);
        exit;
    }

    // เชื่อมต่อฐานข้อมูล
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // อัพเดทข้อมูลผู้ใช้
    $user->id = $_SESSION['user_id'];
    $user->full_name = $data['full_name'];
    $user->phone = $data['phone'] ?? null;

    if ($user->updateProfile()) {
        // ดึงข้อมูลผู้ใช้ล่าสุด
        $updatedUser = $user->getById($user->id);
        
        // อัพเดท session
        $_SESSION['user'] = [
            'id' => $updatedUser['id'],
            'username' => $updatedUser['username'],
            'email' => $updatedUser['email'],
            'full_name' => $updatedUser['full_name'],
            'phone' => $updatedUser['phone'],
            'role' => $updatedUser['role']
        ];

        echo json_encode([
            "status" => "success",
            "message" => "อัพเดทข้อมูลสำเร็จ",
            "user" => $_SESSION['user']
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "ไม่สามารถอัพเดทข้อมูลได้"
        ]);
    }

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "เกิดข้อผิดพลาดในการอัพเดทข้อมูล"
    ]);
}
?> 