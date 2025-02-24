export class PromotionService {
    // ✅ ใช้ `handleResponse()` เพื่อจัดการ API Response
    static async handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const result = await response.json();
    
        if (result.status !== 'success') {
            console.error("❌ API Error:", result.message);
            return null; // ✅ คืนค่า null ถ้าสถานะไม่ใช่ success
        }
    
        return result; // ✅ คืน result ทั้งหมด แทนที่จะคืนแค่ result.data
    }

    // ✅ ดึงข้อมูลโปรโมชั่นทั้งหมด
    static async getPromotions() {
        try {
            const response = await fetch('/mali-clear-clinic/api/promotion/Promotion.php');
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            return [];
        }
    }

    // ✅ สร้างโปรโมชั่นใหม่
    static async createPromotion(formData) {
        try {
            const response = await fetch('/mali-clear-clinic/api/promotion/Promotion.php', {
                method: 'POST',
                body: formData
            });
    
            const result = await this.handleResponse(response);
            if (result) {
                return result; // ✅ คืนค่าที่ถูกต้อง
            }
            return null; // ✅ ถ้าเกิดข้อผิดพลาด ให้คืนค่า null
        } catch (error) {
            console.error('Error creating promotion:', error);
            return null; // ✅ ป้องกันการคืนค่า undefined
        }
    }
    
    // ✅ ลบโปรโมชั่น
    static async deletePromotion(id) {
        try {
            const response = await fetch('/mali-clear-clinic/api/promotion/Promotion.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error deleting promotion:', error);
            return { status: 'error', message: error.message };
        }
    }

    // ✅ ดึงข้อมูลโปรโมชั่นตาม ID
    static async getPromotionById(id) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/promotion/Promotion.php?id=${id}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching promotion:', error);
            throw error;
        }
    }

    static async updatePromotion(id, formData) {
        try {
            formData.append('_method', 'PUT'); // ✅ ใช้ `_method=PUT` เพื่อให้ PHP รู้ว่าเป็น `PUT`
            formData.append('id', id); // ✅ ใส่ `id` ของโปรโมชั่นที่ต้องการอัปเดต
    
            console.log("🔹 Debug: Updating promotion ID:", id);
            console.log("📦 FormData:", [...formData.entries()]);
    
            const response = await fetch('/mali-clear-clinic/api/promotion/Promotion.php', {
                method: 'POST', // ✅ ใช้ `POST` แต่ PHP จะเข้าใจว่าเป็น `PUT`
                body: formData
            });
    
            const result = await this.handleResponse(response);
            return result ? result : null;
        } catch (error) {
            console.error('❌ Error updating promotion:', error);
            return null;
        }
    }
}
