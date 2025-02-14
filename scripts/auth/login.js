document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ

        const formData = new FormData(this);

        try {
            const response = await fetch("/mali-clear-clinic/Services/Auth/LoginService.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json(); // แปลงผลลัพธ์จาก PHP เป็น JSON

            if (result.status === "success") {
                alert(result.message); // แจ้งผลสำเร็จ
                window.location.href = "service.html"; // เปลี่ยนไปที่หน้า dashboard หรือหน้าอื่นๆ
            } else {
                alert(result.message); // แจ้งข้อผิดพลาด เช่น อีเมลหรือรหัสผิด
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error, please try again.");
        }
    });
});
