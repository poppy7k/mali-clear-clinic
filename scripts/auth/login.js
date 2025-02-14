document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ

        const formData = new FormData(this);

        try {
            const response = await fetch("/mali-clear-clinic/Services/Auth/LoginService.php", {
                method: "POST",
                body: formData
            });

            // ตรวจสอบรหัสสถานะของการตอบกลับ
            if (!response.ok) {
                console.error(`Server error: ${response.status}`);
                alert(`Server error: ${response.status}`);
                return;
            }

            // ดึงข้อมูลที่ส่งกลับจากเซิร์ฟเวอร์เป็นข้อความ
            const textResponse = await response.text();
            console.log("Response from server:", textResponse); // ตรวจสอบเนื้อหาที่ตอบกลับจากเซิร์ฟเวอร์

            // ลองแปลงเป็น JSON
            try {
                const result = JSON.parse(textResponse); // แปลงข้อความเป็น JSON
                if (result.status === "success") {
                    alert(result.message); // แจ้งผลสำเร็จ
                    window.location.href = "service.html"; // เปลี่ยนไปที่หน้า dashboard หรือหน้าอื่นๆ
                } else {
                    alert(result.message); // แจ้งข้อผิดพลาด เช่น อีเมลหรือรหัสผิด
                }
            } catch (e) {
                console.error("Failed to parse JSON:", e);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error, please try again.");
        }
    });
});
