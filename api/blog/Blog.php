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
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['title'], $data['content'], $data['excerpt'], $data['image'], $data['status'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $blog->title = $data['title'];
    $blog->content = $data['content'];
    $blog->excerpt = $data['excerpt'];
    $blog->image = $data['image'];
    $blog->status = $data['status'];

    if ($blog->create()) {
        echo json_encode(["status" => "success", "message" => "Blog created successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to create blog"]);
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'], $data['title'], $data['content'], $data['excerpt'], $data['image'], $data['status'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $blog->id = $data['id'];
    $blog->title = $data['title'];
    $blog->content = $data['content'];
    $blog->excerpt = $data['excerpt'];
    $blog->image = $data['image'];
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
