<?php
session_start(); // เริ่ม session
header("Content-Type: application/json");

// Debug: ดูค่า session ID และ session ที่ถูกเก็บไว้
error_log("Session ID: " . session_id());
error_log(print_r($_SESSION, true));

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "success",
        "message" => "User is logged in",
        "user" => [
            "user_id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'],
            "email" => $_SESSION['email'],
            "role" => $_SESSION['role'],
        ]
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No user is logged in"
    ]);
}
exit;
?>
