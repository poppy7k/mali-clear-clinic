<?php
header("Content-Type: application/json"); // กำหนดให้ Response เป็น JSON
require_once '../../Controllers/User.php';
require_once '../../Controllers/Database.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// รับข้อมูลจากฟอร์ม
$user->username = $_POST['username'] ?? '';
$user->email = $_POST['email'] ?? '';
$user->password = password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT);

// ตรวจสอบอีเมลซ้ำ
if ($user->emailExists()) {
    echo json_encode(["status" => "error", "message" => "Email already exists."]);
    exit;
}

// สมัครสมาชิก
if ($user->register()) {
    echo json_encode(["status" => "success", "message" => "Registration successful!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error during registration."]);
}
exit;
?>
