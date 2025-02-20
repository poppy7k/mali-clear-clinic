import { getUserSession } from '../../scripts/auth/userSession.js';

class AdminPromotions extends HTMLElement {
    constructor() {
        super();
        this.promotions = [];
    }

    async connectedCallback() {
        // ตรวจสอบสิทธิ์ admin โดยใช้ getUserSession
        const user = await getUserSession();
        if (!user || user.role !== 'ADMIN') {
            window.location.href = '/mali-clear-clinic/';
            return;
        }
        
        await this.loadPromotions();
        this.render();
    }

    async loadPromotions() {
        try {
            const response = await fetch('/mali-clear-clinic/api/Promotion.php');
            const result = await response.json();
            if (result.status === 'success') {
                this.promotions = result.data;
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
        }
    }

    async deletePromotion(id) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/Promotion.php?id=${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.status === 'success') {
                await this.loadPromotions();
                this.render();
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        try {
            const response = await fetch('/mali-clear-clinic/api/Promotion.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                event.target.reset();
                await this.loadPromotions();
                this.render();
            }
        } catch (error) {
            console.error('Error creating promotion:', error);
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h2 class="text-2xl font-bold mb-6">จัดการโปรโมชั่น</h2>
                
                <!-- ฟอร์มเพิ่มโปรโมชั่น -->
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onsubmit="this.closest('admin-promotions').handleSubmit(event)">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
                            ชื่อโปรโมชั่น
                        </label>
                        <form-input 
                            type="text"
                            id="title"
                            name="title"
                            placeholder="กรอกชื่อโปรโมชั่น"
                            required>
                        </form-input>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
                            รายละเอียด
                        </label>
                        <textarea 
                            class="w-full my-2 px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 transition-all duration-300 outline-none"
                            id="description" 
                            name="description" 
                            placeholder="กรอกรายละเอียดโปรโมชั่น"
                            required>
                        </textarea>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="image">
                            รูปภาพ
                        </label>
                        <form-input 
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            required>
                        </form-input>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300" 
                            type="submit">
                            เพิ่มโปรโมชั่น
                        </button>
                    </div>
                </form>

                <!-- ตารางแสดงโปรโมชั่น -->
                <div class="bg-white shadow-md rounded my-6">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th class="py-3 px-6 text-left">รูปภาพ</th>
                                <th class="py-3 px-6 text-left">ชื่อโปรโมชั่น</th>
                                <th class="py-3 px-6 text-left">รายละเอียด</th>
                                <th class="py-3 px-6 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="text-gray-600 text-sm font-light">
                            ${this.promotions.map(promo => `
                                <tr class="border-b border-gray-200 hover:bg-gray-100">
                                    <td class="py-3 px-6 text-left">
                                        <img src="/mali-clear-clinic/assets/images/${promo.image}" 
                                            alt="${promo.title}" 
                                            class="w-20 h-20 object-cover rounded">
                                    </td>
                                    <td class="py-3 px-6 text-left">${promo.title}</td>
                                    <td class="py-3 px-6 text-left">${promo.description}</td>
                                    <td class="py-3 px-6 text-center">
                                        <button onclick="this.closest('admin-promotions').deletePromotion(${promo.id})"
                                            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition-all duration-300">
                                            ลบ
                                        </button>
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