document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerForm").addEventListener("submit", async function(event) {
        event.preventDefault(); 

        const formData = new FormData(this);

        try {
            const response = await fetch("/mali-clear-clinic/api/Auth/RegisterService.php", {
                method: "POST",
                body: formData
            });

            const textResponse = await response.text(); // อ่านค่าที่ส่งกลับมาก่อน
            console.log("RAW Response:", textResponse); // ✅ เช็คว่า PHP ส่งอะไรกลับมา

            const result = JSON.parse(textResponse); // แปลงเป็น JSON
            console.log("Parsed JSON:", result); // ✅ ตรวจสอบว่า JSON ถูกต้องไหม

            if (result.status === "success") {
                alert(result.message);
                window.location.href = "login.html";
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error, please try again.");
        }
    });
});
