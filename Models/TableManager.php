<?php
class TableManager {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ✅ ตรวจสอบและอัปเดตตารางให้ตรงกับ schema ที่กำหนด
    public function validateAndUpdateTableStructure($tableName, $expectedFields) {
        try {
            // 🔹 ดึงโครงสร้างฟิลด์ปัจจุบันของตาราง
            $stmt = $this->conn->prepare("DESCRIBE `$tableName`");
            $stmt->execute();
            $existingFields = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 🔹 แปลงฟิลด์ที่มีอยู่เป็น array
            $existingFieldNames = array_column($existingFields, 'Field');

            foreach ($expectedFields as $field => $definition) {
                if (!in_array($field, $existingFieldNames)) {
                    // ✅ ถ้าฟิลด์ไม่อยู่ในตาราง ให้เพิ่ม
                    $alterQuery = "ALTER TABLE `$tableName` ADD COLUMN `$field` $definition";
                    $alterStmt = $this->conn->prepare($alterQuery);
                    $alterStmt->execute();
                    echo "✅ Field `$field` added to `$tableName` successfully.\n";
                }
            }
        } catch (PDOException $e) {
            echo "❌ Error validating `$tableName`: " . $e->getMessage();
        }
    }
}
?>
