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
        this.promotions = await PromotionService.getPromotions();
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

    render() {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h2 class="text-2xl font-bold mb-6">จัดการโปรโมชั่น</h2>

                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onsubmit="this.closest('admin-promotions').handleSubmit(event)">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">ชื่อโปรโมชั่น</label>
                        <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg">
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">รายละเอียด</label>
                        <textarea name="description" required class="w-full px-3 py-2 border rounded-lg"></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">รูปภาพ</label>
                        <input type="file" name="image" accept="image/*" required class="w-full">
                    </div>

                    <button class="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded" type="submit">
                        เพิ่มโปรโมชั่น
                    </button>
                </form>

                <div class="bg-white shadow-md rounded my-6">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-200 text-gray-600 uppercase text-sm">
                                <th class="py-3 px-6">รูปภาพ</th>
                                <th class="py-3 px-6">ชื่อโปรโมชั่น</th>
                                <th class="py-3 px-6">รายละเอียด</th>
                                <th class="py-3 px-6">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.promotions.map(promo => `
                                <tr>
                                    <td class="py-3 px-6"><img src="/mali-clear-clinic/assets/images/${promo.image}" class="w-20 h-20"></td>
                                    <td class="py-3 px-6">${promo.title}</td>
                                    <td class="py-3 px-6">${promo.description}</td>
                                    <td class="py-3 px-6">
                                        <button onclick="this.closest('admin-promotions').deletePromotion(${promo.id})" class="bg-red-500 text-white py-2 px-4 rounded">ลบ</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define('admin-promotions', AdminPromotions);
