<?php
if (php_sapi_name() !== 'cli') {
    die("This script can only be run from the command line.");
}

require_once __DIR__ . '/Models/Database.php';
require_once __DIR__ . '/Models/TableManager.php';

$db = (new Database())->getConnection();
$tableManager = new TableManager($db);

require_once __DIR__ . '/Models/User.php';
require_once __DIR__ . '/Models/Category.php';
require_once __DIR__ . '/Models/Product.php';
require_once __DIR__ . '/Models/Booking.php';
require_once __DIR__ . '/Models/Promotion.php';
require_once __DIR__ . '/Models/Purchase.php';
require_once __DIR__ . '/Models/Blog.php';

// ✅ ตรวจสอบและอัปเดตตารางทั้งหมด
$tableManager->validateAndUpdateTableStructure("users", User::$schema);
$tableManager->validateAndUpdateTableStructure("categories", Category::$schema);
$tableManager->validateAndUpdateTableStructure("products", Product::$schema);
$tableManager->validateAndUpdateTableStructure("bookings", Booking::$schema);
$tableManager->validateAndUpdateTableStructure("promotions", Promotion::$schema);
$tableManager->validateAndUpdateTableStructure("purchases", Purchase::$schema);
$tableManager->validateAndUpdateTableStructure("blogs", Blog::$schema);

echo "✅ Database schema updated successfully!\n";
?>
