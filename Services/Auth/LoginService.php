<?php
header("Content-Type: application/json");
require_once '../../Controllers/User.php';
require_once '../../Controllers/Database.php';

session_start(); // เริ่ม session
$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// รับค่าจากฟอร์ม
$user->email = $_POST['email'] ?? '';
$user->password = $_POST['password'] ?? '';

// ตรวจสอบอีเมลและรหัสผ่าน
if ($user->login()) {
    // เก็บข้อมูล session
    $_SESSION['user_id'] = $user->id;
    $_SESSION['username'] = $user->username;
    $_SESSION['email'] = $user->email;

    session_regenerate_id(false);
    session_write_close();

    echo json_encode([
        "status" => "success",
        "message" => "Login successful!",
        "user" => [
            "user_id" => $user->id,
            "username" => $user->username,
            "email" => $user->email
        ]
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid email or password."
    ]);
}
exit;
?>
