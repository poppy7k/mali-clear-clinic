<?php
header("Content-Type: application/json");

// แสดง error ชัดเจน (เฉพาะตอน debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../../Models/Database.php');
require_once (__DIR__ . '/../../Models/Blog.php');

// สร้างการเชื่อมต่อกับฐานข้อมูล
$database = new Database();
$db = $database->getConnection();

// ตรวจสอบว่าเชื่อมต่อฐานข้อมูลสำเร็จหรือไม่
if (!$db) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

// สร้างออบเจ็กต์ Blog
$blog = new Blog($db);

$method = $_SERVER['REQUEST_METHOD'];

// ตรวจสอบ _method ใน FormData
if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        if ($blog->getById($id)) {
            echo json_encode(["status" => "success", "data" => $blog]);
        } else {
            echo json_encode(["status" => "error", "message" => "Blog not found"]);
        }
    } else {
        $stmt = $blog->getAll();
        $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $blogs]);
    }
    exit;
}

if ($method === 'POST') {
    if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
        try {
            error_log("Received PUT data via POST: " . print_r($_POST, true));
            error_log("Received FILES: " . print_r($_FILES, true));

            // ตรวจสอบ ID
            if (!isset($_POST['id']) || empty($_POST['id'])) {
                echo json_encode(["status" => "error", "message" => "Missing blog ID"]);
                exit;
            }

            // ตรวจสอบข้อมูลที่จำเป็น
            $required_fields = ['title', 'content', 'excerpt', 'status'];
            foreach ($required_fields as $field) {
                if (!isset($_POST[$field]) || empty($_POST[$field])) {
                    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
                    exit;
                }
            }

            // กำหนดค่าให้กับ object
            $blog->id = $_POST['id'];
            $blog->title = htmlspecialchars(strip_tags($_POST['title']));
            $blog->content = $_POST['content']; // Rich text editor ไม่ใช้ strip_tags
            $blog->excerpt = htmlspecialchars(strip_tags($_POST['excerpt']));
            $blog->status = $_POST['status'];

            // จัดการอัปโหลดรูปภาพ (ถ้ามี)
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $image = $_FILES['image'];
                $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
                $fileExtension = strtolower(pathinfo($image['name'], PATHINFO_EXTENSION));

                if (!in_array($fileExtension, $allowedTypes)) {
                    echo json_encode(["status" => "error", "message" => "Invalid file format. Allowed: JPG, PNG, GIF"]);
                    exit;
                }

                $image_name = time() . '-' . bin2hex(random_bytes(8)) . '.' . $fileExtension;
                $target_path = "../../assets/images/" . $image_name;

                if (move_uploaded_file($image['tmp_name'], $target_path)) {
                    // ลบรูปเก่า (ถ้ามี)
                    $old_image = $blog->getImage($blog->id);
                    if ($old_image) {
                        $old_image_path = "../../assets/images/" . $old_image;
                        if (file_exists($old_image_path)) {
                            unlink($old_image_path);
                        }
                    }
                    $blog->image = $image_name;
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
                    exit;
                }
            }

            // อัปเดตข้อมูล
            if ($blog->update()) {
                echo json_encode(["status" => "success", "message" => "Blog updated successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update blog"]);
            }

        } catch (Exception $e) {
            error_log("Error updating blog: " . $e->getMessage());
            echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
        }
        exit;
    }

    try {
        error_log("Received POST data: " . print_r($_POST, true));
        error_log("Received FILES: " . print_r($_FILES, true));

        // ตรวจสอบข้อมูลที่จำเป็น
        $required_fields = ['title', 'content', 'excerpt', 'status'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                echo json_encode(["status" => "error", "message" => "Missing required fields"]);
                exit;
            }
        }

        // กำหนดค่าให้กับ object
        $blog->title = htmlspecialchars(strip_tags($_POST['title']));
        $blog->content = $_POST['content'];
        $blog->excerpt = htmlspecialchars(strip_tags($_POST['excerpt']));
        $blog->status = $_POST['status'];

        // จัดการอัปโหลดรูปภาพ
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $image = $_FILES['image'];
            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
            $fileExtension = strtolower(pathinfo($image['name'], PATHINFO_EXTENSION));

            if (!in_array($fileExtension, $allowedTypes)) {
                echo json_encode(["status" => "error", "message" => "Invalid file format. Allowed: JPG, PNG, GIF"]);
                exit;
            }

            $image_name = time() . '-' . bin2hex(random_bytes(8)) . '.' . $fileExtension;
            $target_path = "../../assets/images/" . $image_name;

            if (move_uploaded_file($image['tmp_name'], $target_path)) {
                $blog->image = $image_name;
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
                exit;
            }
        } else {
            $blog->image = null; // ไม่มีภาพก็ให้เป็นค่าว่าง
        }

        // บันทึกลงฐานข้อมูล
        if ($blog->create()) {
            echo json_encode(["status" => "success", "message" => "Blog created successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create blog"]);
        }

    } catch (Exception $e) {
        error_log("Error creating blog: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    }
    exit;
}

if ($method === 'PUT') {
    $data = $_POST;
    $image = $_FILES['image'] ?? null;

    if (!isset($data['title'], $data['content'], $data['excerpt'], $data['status'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }
 

    $blog->id = $data['id'];
    $blog->title = $data['title'];
    $blog->content = $data['content'];
    $blog->excerpt = $data['excerpt'];
    $blog->image = $image;
    $blog->status = $data['status'];

    if ($blog->update()) {
        echo json_encode(["status" => "success", "message" => "Blog updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update blog"]);
    }
    exit;
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Missing blog ID"]);
        exit;
    }

    $blog->id = $data['id'];

    if ($blog->delete()) {
        echo json_encode(["status" => "success", "message" => "Blog deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete blog"]);
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
exit;
?>
