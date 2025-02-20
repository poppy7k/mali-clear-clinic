<?php
header("Content-Type: application/json");

// แสดง error ชัดเจน (เฉพาะตอน debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../Models/Database.php');
require_once (__DIR__ . '/../Models/Product.php');

// สร้างการเชื่อมต่อกับฐานข้อมูล
$database = new Database();
$db = $database->getConnection();

// ตรวจสอบว่าเชื่อมต่อฐานข้อมูลสำเร็จหรือไม่
if (!$db) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

// สร้างออบเจ็กต์ Product
$product = new Product($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // ตรวจสอบว่ามีการส่ง category_id มาหรือไม่
    $category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;

    // ถ้ามี category_id ให้ดึงสินค้าตามหมวดหมู่
    if ($category_id) {
        $products = $product->getProductsByCategory($category_id);
    } else {
        $products = $product->getAllProducts();
    }

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (empty($products)) {
        echo json_encode(["status" => "success", "data" => []]); // คืนค่าเป็นอาร์เรย์ว่างถ้าไม่มีสินค้า
        exit;
    }

    // ส่งข้อมูลผลิตภัณฑ์ออกไป
    echo json_encode(["status" => "success", "data" => $products]);
    exit;
}

if ($method === 'POST') {
    // รับข้อมูลที่ส่งมาจาก client
    $data = json_decode(file_get_contents("php://input"), true);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['name'], $data['description'], $data['price'], $data['image'], $data['category_id'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // สร้างผลิตภัณฑ์ใหม่
    $product->name = $data['name'];
    $product->description = $data['description'];
    $product->price = $data['price'];
    $product->image = $data['image'];
    $product->category_id = $data['category_id'];

    if ($product->create()) {
        echo json_encode(["status" => "success", "message" => "Product created successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to create product"]);
    }
    exit;
}

if ($method === 'PUT') {
    // รับข้อมูลที่ส่งมาจาก client
    $data = json_decode(file_get_contents("php://input"), true);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['id'], $data['name'], $data['description'], $data['price'], $data['image'], $data['category_id'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // อัปเดตข้อมูลผลิตภัณฑ์
    $product->id = $data['id'];
    $product->name = $data['name'];
    $product->description = $data['description'];
    $product->price = $data['price'];
    $product->image = $data['image'];
    $product->category_id = $data['category_id'];

    if ($product->update()) {
        echo json_encode(["status" => "success", "message" => "Product updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update product"]);
    }
    exit;
}

if ($method === 'DELETE') {
    // รับข้อมูลที่ส่งมาจาก client
    $data = json_decode(file_get_contents("php://input"), true);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Missing product ID"]);
        exit;
    }

    // ลบผลิตภัณฑ์
    $product->id = $data['id'];

    if ($product->delete()) {
        echo json_encode(["status" => "success", "message" => "Product deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete product"]);
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
exit;
?>
