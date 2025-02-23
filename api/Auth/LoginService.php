<?php
header("Content-Type: application/json");
require_once '../../Models/User.php';
require_once '../../Models/Database.php';

session_start(); // เริ่ม session
$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// รับค่าจากฟอร์ม
$user->email = $_POST['email'] ?? '';
$user->password = $_POST['password'] ?? '';

// ตรวจสอบอีเมลและรหัสผ่าน
if ($user->login()) {
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    $stmt = $db->prepare("SELECT full_name, phone, address, role FROM users WHERE id = ?");
    $stmt->execute([$user->id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $user->full_name = $result['full_name'] ?? null;
    $user->phone = $result['phone'] ?? null;
    $user->address = $result['address'] ?? null;
    $user->role = $result['role'];

    // เก็บข้อมูล session
    $_SESSION['user_id'] = $user->id;
    $_SESSION['username'] = $user->username;
    $_SESSION['email'] = $user->email;
    $_SESSION['full_name'] = $user->full_name;
    $_SESSION['phone'] = $user->phone;
    $_SESSION['address'] = $user->address;
    $_SESSION['role'] = $user->role;

    session_regenerate_id(false);
    session_write_close();

    echo json_encode([
        "status" => "success",
        "message" => "Login successful!",
        "user" => [
            "user_id" => $user->id,
            "username" => $user->username,
            "email" => $user->email,
            "full_name" => $user->full_name,
            "phone" => $user->phone,
            "address" => $user->address,
            "role" => $user->role
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
