<?php
header("Content-Type: application/json");

// แสดง error ชัดเจน (เฉพาะตอน debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../../Models/Database.php');
require_once (__DIR__ . '/../../Models/Product.php');

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
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;
    $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;

    // เพิ่มเงื่อนไขการดึงข้อมูลตาม product_id
    if ($product_id) {
        $product_data = $product->getProductById($product_id);
        if ($product_data) {
            echo json_encode(["status" => "success", "data" => $product_data]);
        } else {
            echo json_encode(["status" => "error", "message" => "Product not found"]);
        }
        exit;
    }
    
    // เงื่อนไขอื่นๆ ที่มีอยู่เดิม
    if ($type && $category_id) {
        $products = $product->getProductsByTypeAndCategory($type, $category_id);
    } else if ($type) {
        $products = $product->getProductsByType($type);
    } else if ($category_id) {
        $products = $product->getProductsByCategory($category_id);
    } else {
        $products = $product->getAllProducts();
    }

    if ($products === false) {
        echo json_encode(["status" => "error", "message" => "Failed to fetch products"]);
        exit;
    }

    echo json_encode(["status" => "success", "data" => $products]);
    exit;
}

if ($method === 'POST') {
    // รับข้อมูลที่ส่งมาจาก client
    $data = json_decode(file_get_contents("php://input"), true);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['name'], $data['description'], $data['price'], $data['image'], $data['category_id'], $data['type'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // ตรวจสอบว่า type ถูกต้อง
    if (!in_array($data['type'], ['PRODUCT', 'SERVICE'])) {
        echo json_encode(["status" => "error", "message" => "Invalid product type"]);
        exit;
    }

    // สร้างผลิตภัณฑ์ใหม่
    $product->name = $data['name'];
    $product->description = $data['description'];
    $product->price = $data['price'];
    $product->image = $data['image'];
    $product->category_id = $data['category_id'];
    $product->type = $data['type'];

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
    if (!isset($data['id'], $data['name'], $data['description'], $data['price'], $data['image'], $data['category_id'], $data['type'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // ตรวจสอบว่า type ถูกต้อง
    if (!in_array($data['type'], ['PRODUCT', 'SERVICE'])) {
        echo json_encode(["status" => "error", "message" => "Invalid product type"]);
        exit;
    }

    // อัปเดตข้อมูลผลิตภัณฑ์
    $product->id = $data['id'];
    $product->name = $data['name'];
    $product->description = $data['description'];
    $product->price = $data['price'];
    $product->image = $data['image'];
    $product->category_id = $data['category_id'];
    $product->type = $data['type'];

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