<?php
header("Content-Type: application/json");
require_once(__DIR__ . '/../../Models/Database.php');
require_once(__DIR__ . '/../../Models/Booking.php');

try {
    $database = new Database();
    $db = $database->getConnection();
    $booking = new Booking($db);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['booking_id'], $data['status'])) {
            // ✅ กรณีแก้ไขสถานะการจอง
            error_log("🔹 Debug: Editing booking_id = " . $data['booking_id'] . " to status = " . $data['status']);

            $bookingId = $data['booking_id'];
            $status = $data['status'];

            if (!$bookingId || !$status) {
                echo json_encode(["status" => "error", "message" => "Missing required fields"]);
                exit;
            }

            if ($booking->updateStatus($bookingId, $status)) {
                echo json_encode(["status" => "success", "message" => "อัปเดตสถานะสำเร็จ"]);
            } else {
                echo json_encode(["status" => "error", "message" => "ไม่สามารถอัปเดตสถานะได้"]);
            }
        } elseif (isset($data['user_id'], $data['product_id'], $data['full_name'], 
                        $data['phone'], $data['address'], $data['booking_date'])) {
            // ✅ กรณีสร้างการจองใหม่
            error_log("🔹 Debug: Creating new booking for user_id = " . $data['user_id']);

            $booking->user_id = $data['user_id'];
            $booking->product_id = $data['product_id'];
            $booking->full_name = $data['full_name'];
            $booking->phone = $data['phone'];
            $booking->address = $data['address'];
            $booking->booking_date = $data['booking_date'];
            $booking->status = 'Pending';

            if ($booking->create()) {
                echo json_encode(["status" => "success", "message" => "Booking successful!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Booking failed"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        }
        exit;
    }

    if ($method === 'GET') {
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

        if ($user_id) {
            $bookings = $booking->getBookingsByUserId($user_id);
        } else {
            $bookings = $booking->getAll();
        }

        echo json_encode(["status" => "success", "bookings" => $bookings]);
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

} catch (PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(["status" => "error", "message" => "Database error occurred", "error_code" => "DB_ERROR"]);
    exit;
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(["status" => "error", "message" => "An unexpected error occurred", "error_code" => "GENERAL_ERROR"]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);