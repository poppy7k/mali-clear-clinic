<?php
session_start(); // เริ่ม session

// ล้างค่าทุกตัวแปร session
$_SESSION = [];

// ทำลาย session
session_destroy();

// ตอบกลับ JSON
echo json_encode([
    "status" => "success",
    "message" => "Logout successful"
]);

exit;
?>
