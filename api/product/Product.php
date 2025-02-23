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

    if ($product_id) {
        $product_data = $product->getProductById($product_id);
        echo json_encode(["status" => $product_data ? "success" : "error", "data" => $product_data ?: "ไม่มีข้อมูล"]);
        exit;
    }
    
    $products = $type && $category_id ? $product->getProductsByTypeAndCategory($type, $category_id)
               : ($type ? $product->getProductsByType($type)
               : ($category_id ? $product->getProductsByCategory($category_id)
               : $product->getAllProducts()));

    echo json_encode(["status" => $products ? "success" : "error", "data" => $products ?: "ไม่มีข้อมูล"]);
    exit;
}

if ($method === 'POST') {
    try {
        // Debug
        error_log("Received POST data: " . print_r($_POST, true));
        error_log("Received FILES: " . print_r($_FILES, true));

        // ตรวจสอบข้อมูลที่จำเป็น
        $required_fields = ['name', 'category_id', 'price', 'type', 'status'];
        $missing_fields = [];
        
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                $missing_fields[] = $field;
            }
        }

        if (!empty($missing_fields)) {
            error_log("Missing fields: " . implode(', ', $missing_fields));
            echo json_encode([
                "status" => "error", 
                "message" => "Missing fields: " . implode(', ', $missing_fields)
            ]);
            exit;
        }

        // กำหนดค่าให้กับ object
        $product->name = $_POST['name'];
        $product->category_id = $_POST['category_id'];
        $product->price = $_POST['price'];
        $product->type = $_POST['type'];
        $product->status = $_POST['status'];
        $product->description = $_POST['description'] ?? '';

        // จัดการรูปภาพ
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $image = $_FILES['image'];
            $image_name = time() . '-' . $image['name'];
            $target_path = "../../assets/images/" . $image_name;

            if (move_uploaded_file($image['tmp_name'], $target_path)) {
                $product->image = $image_name;
            } else {
                error_log("Failed to move uploaded file");
                echo json_encode([
                    "status" => "error",
                    "message" => "Failed to upload image"
                ]);
                exit;
            }
        }

        if ($product->create()) {
            echo json_encode([
                "status" => "success",
                "message" => "Product created successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to create product"
            ]);
        }

    } catch (Exception $e) {
        error_log("Error creating product: " . $e->getMessage());
        echo json_encode([
            "status" => "error",
            "message" => "Server error: " . $e->getMessage()
        ]);
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Missing product ID"]);
        exit;
    }

    // กำหนดค่าให้กับ object
    $product->id = $data['id'];
    $product->name = $data['name'];
    $product->category_id = $data['category_id'];
    $product->price = $data['price'];
    $product->description = $data['description'] ?? '';
    $product->image = $data['image'] ?? '';
    $product->type = $data['type'];
    $product->status = $data['status']; // เพิ่ม status

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

if ($method === 'PATCH') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id']) || !isset($data['status'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // อัปเดตเฉพาะสถานะ
    $query = "UPDATE products SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        ':id' => $data['id'],
        ':status' => $data['status']
    ])) {
        echo json_encode(["status" => "success", "message" => "Product status updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update product status"]);
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
exit;
?> 