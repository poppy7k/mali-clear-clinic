import { getUserSession } from '../../scripts/auth/userSession.js';
import { PromotionService } from '../../services/PromotionService.js';

class AdminPromotions extends HTMLElement {
    constructor() {
        super();
        this.promotions = [];
    }

    async connectedCallback() {
        const user = await getUserSession();
        if (!user || user.role !== 'ADMIN') {
            window.location.href = '/mali-clear-clinic/';
            return;
        }
        await this.loadPromotions();
        this.render();
    }

    async loadPromotions() {
        const response = await PromotionService.getPromotions();
        this.promotions = response.data || []; // ✅ ดึง `data` จาก response
        this.render();
    }

    async deletePromotion(id) {
        if (!confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) return;

        const result = await PromotionService.deletePromotion(id);
        if (result) {
            await this.loadPromotions();
        } else {
            alert('ลบโปรโมชั่นไม่สำเร็จ กรุณาลองใหม่');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const result = await PromotionService.createPromotion(formData);

        if (result) {
            event.target.reset();
            await this.loadPromotions();
        } else {
            alert('เพิ่มโปรโมชั่นไม่สำเร็จ กรุณาลองใหม่');
        }
    }

    async editPromotion(id) {
        window.location.href = `/mali-clear-clinic/pages/admin-promotion-form.html?id=${id}`;
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">จัดการโปรโมชั่น</h2>
                    <custom-button 
                        text="เพิ่มโปรโมชั่นใหม่"
                        color="white"
                        bgColor="green-600"
                        hoverBg="green-500"
                        icon=""
                        id="add-promotion-btn"
                        class="w-auto">
                    </custom-button>
                </div>

                <div class="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead class="border-b border-gray-200">
                            <tr class="text-gray-800 font-semibold">
                                <th class="p-3 text-left">รูปภาพ</th>
                                <th class="p-3 text-left">ชื่อโปรโมชั่น</th>
                                <th class="p-3 text-left">รายละเอียด</th>
                                <th class="p-3 text-left">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.promotions.length > 0 ? this.promotions.map(promo => `
                                <tr class="border-b border-gray-200 text-gray-700">
                                    <td class="p-3">
                                        <img src="/mali-clear-clinic/assets/images/${promo.image}" 
                                             alt="${promo.title}"
                                             class="h-16 w-16 object-cover rounded-lg"
                                             onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                                    </td>
                                    <td class="p-3">
                                        <div class="font-medium">${promo.title}</div>
                                    </td>
                                    <td class="p-3">
                                        <div class="text-sm text-gray-500">${promo.description}</div>
                                    </td>
                                    <td class="p-3">
                                        <div class="flex gap-4">
                                            <button onclick="this.closest('admin-promotions').editPromotion(${promo.id})" 
                                                    class="text-blue-600 hover:text-blue-900">
                                                แก้ไข
                                            </button>
                                            <button onclick="this.closest('admin-promotions').deletePromotion(${promo.id})" 
                                                    class="text-red-600 hover:text-red-900">
                                                ลบ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="4" class="p-4 text-center">ไม่พบข้อมูลโปรโมชั่น</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.querySelector('#add-promotion-btn').addEventListener('click', () => {
            window.location.href = '/mali-clear-clinic/pages/admin-promotion-form.html';
        });
    }
}

customElements.define('admin-promotions', AdminPromotions);
