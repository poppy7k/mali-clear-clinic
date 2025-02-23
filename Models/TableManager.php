<?php
class TableManager {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ✅ ตรวจสอบและอัปเดตตารางให้ตรงกับ Schema ที่กำหนด
    public function validateAndUpdateTableStructure($tableName, $expectedFields) {
        try {
            // ✅ ถ้าตารางไม่มีอยู่ ให้สร้างใหม่
            if (!$this->tableExists($tableName)) {
                $this->createTable($tableName, $expectedFields);
                $this->runSeeder($tableName);
            }

            // 🔹 ดึงโครงสร้างฟิลด์ปัจจุบันของตาราง
            $stmt = $this->conn->prepare("DESCRIBE `$tableName`");
            $stmt->execute();
            $existingFields = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $existingFieldNames = array_column($existingFields, 'Field');

            foreach ($expectedFields as $field => $definition) {
                if (strpos($field, "CONSTRAINT") === 0) {
                    if ($this->foreignKeyExists($tableName, $field)) {
                        error_log("⚠️ Foreign Key `$field` already exists in `$tableName`, skipping...");
                        continue;
                    }

                    // ✅ ลบ Foreign Key เก่าถ้ามี
                    $this->dropForeignKeyIfExists($tableName, $field);

                    // ✅ เพิ่ม Foreign Key ใหม่
                    $alterFKQuery = "ALTER TABLE `$tableName` ADD $field $definition";
                    $this->conn->exec($alterFKQuery);
                    error_log("✅ Foreign Key `$field` added to `$tableName` successfully.");
                } else {
                    // ✅ เพิ่มฟิลด์ปกติ
                    if (!in_array($field, $existingFieldNames)) {
                        $alterQuery = "ALTER TABLE `$tableName` ADD COLUMN `$field` $definition";
                        $this->conn->exec($alterQuery);
                        error_log("✅ Field `$field` added to `$tableName` successfully.");
                    }
                }
            }
        } catch (PDOException $e) {
            error_log("❌ Error validating `$tableName`: " . $e->getMessage());
        }
    }

    // ✅ ตรวจสอบว่าตารางมีอยู่หรือไม่
    private function tableExists($tableName) {
        $query = "SHOW TABLES LIKE :tableName";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":tableName", $tableName);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // ✅ สร้างตารางใหม่ถ้ายังไม่มีอยู่
    private function createTable($tableName, $schema) {
        try {
            $fields = [];
            $foreignKeys = [];

            foreach ($schema as $field => $definition) {
                if (strpos($field, "CONSTRAINT") === 0) {
                    $foreignKeys[] = "$field $definition";
                } else {
                    $fields[] = "`$field` $definition";
                }
            }

            // ✅ รวมฟิลด์หลัก + FOREIGN KEY
            $tableDefinition = implode(", ", array_merge($fields, $foreignKeys));
            $createTableQuery = "CREATE TABLE IF NOT EXISTS `$tableName` ($tableDefinition)";

            $this->conn->exec($createTableQuery);
            error_log("✅ Table `$tableName` created successfully.");
        } catch (PDOException $e) {
            error_log("❌ Error creating table `$tableName`: " . $e->getMessage());
        }
    }

    private function runSeeder($tableName) {
        $seederClass = ucfirst($tableName) . "Seeder"; // แปลงชื่อเป็น Class เช่น `products` -> `ProductsSeeder`
        $seederFile = __DIR__ . "/../Seeders/{$seederClass}.php";

        if (file_exists($seederFile)) {
            require_once $seederFile;
            if (class_exists($seederClass)) {
                $seeder = new $seederClass($this->conn);
                $seeder->seed();
                error_log("✅ Seeder `$seederClass` executed for `$tableName`.");
            } else {
                error_log("⚠️ Seeder class `$seederClass` not found for `$tableName`.");
            }
        } else {
            error_log("⚠️ Seeder file `$seederFile` not found for `$tableName`.");
        }
    }

    // ✅ ตรวจสอบว่ามี Foreign Key นี้อยู่แล้วหรือไม่
    private function foreignKeyExists($tableName, $constraintName) {
        $query = "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                  WHERE TABLE_NAME = :tableName AND CONSTRAINT_NAME = :constraintName";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":tableName", $tableName);
        $stmt->bindParam(":constraintName", $constraintName);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // ✅ ลบ Foreign Key เก่าถ้ามี
    private function dropForeignKeyIfExists($tableName, $constraintName) {
        $query = "ALTER TABLE `$tableName` DROP FOREIGN KEY `$constraintName`";
        try {
            $this->conn->exec($query);
            error_log("✅ Dropped existing Foreign Key `$constraintName` from `$tableName`.");
        } catch (PDOException $e) {
            // ถ้าคีย์ไม่มีอยู่ ก็ไม่ต้องทำอะไร
        }
    }
}
?>
