export class PromotionService {
    // ✅ ใช้ `handleResponse()` เพื่อจัดการ API Response
    static async handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status !== 'success') {
            throw new Error(result.message || 'Unknown API error');
        }
        return result.data;
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
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating promotion:', error);
            return { status: 'error', message: error.message };
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
}
