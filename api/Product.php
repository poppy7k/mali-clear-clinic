<?php
header("Content-Type: application/json");

// แสดง error ชัดเจน (เฉพาะตอน debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../Models/Database.php';
require_once '../Models/Product.php';

// สร้างการเชื่อมต่อกับฐานข้อมูล
$database = new Database();
$db = $database->getConnection();

// ตรวจสอบว่าเชื่อมต่อฐานข้อมูลสำเร็จหรือไม่
if (!$db) {
    echo json_encode(["error" => "Database connection failed."]);
    exit;
}

// สร้างออบเจ็กต์ Product
$product = new Product($db);

// เรียกใช้ฟังก์ชันดึงข้อมูลผลิตภัณฑ์
$products = $product->getAllProducts();

// ตรวจสอบว่ามีข้อมูลหรือไม่
if (empty($products)) {
    echo json_encode(["message" => "No products found."]);
    exit;
}

// ส่งข้อมูลผลิตภัณฑ์ออกไป
echo json_encode(["status" => "success", "data" => $products]);
exit;
?>
