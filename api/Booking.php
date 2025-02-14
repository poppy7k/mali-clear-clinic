<?php
header("Content-Type: application/json");
require_once(__DIR__ . '/../Models/Database.php');
require_once(__DIR__ . '/../Models/Booking.php');

$database = new Database();
$db = $database->getConnection();
$booking = new Booking($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['user_id'], $data['product_id'], $data['booking_date'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $booking->user_id = $data['user_id'];
    $booking->product_id = $data['product_id'];
    $booking->booking_date = $data['booking_date'];
    $booking->status = 'Pending';

    if ($booking->create()) {
        echo json_encode(["status" => "success", "message" => "Booking successful!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Booking failed"]);
    }
    exit;
}

if ($method === 'GET') {
    if (isset($_GET["user_id"])) {
        $user_id = $_GET["user_id"];
        $stmt = $db->prepare("SELECT b.id, p.name AS product_name, b.booking_date, b.status FROM bookings b JOIN products p ON b.product_id = p.id WHERE b.user_id = ?");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        $bookings = $booking->readAll();
        echo json_encode($bookings);
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'], $data['status'])) {
        echo json_encode(["status" => "error", "message" => "Missing fields"]);
        exit;
    }

    $stmt = $db->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    if ($stmt->execute([$data['status'], $data['id']])) {
        echo json_encode(["status" => "success", "message" => "Booking updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update booking"]);
    }
    exit;
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Missing booking ID"]);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
    if ($stmt->execute([$data['id']])) {
        echo json_encode(["status" => "success", "message" => "Booking deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete booking"]);
    }
    exit;
}



echo json_encode(["status" => "error", "message" => "Invalid request method"]);