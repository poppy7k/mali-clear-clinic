import { PromotionService } from '../../services/PromotionService.js';

class ContentPromotions extends HTMLElement {
    constructor() {
        super();
        this.promotions = [];
    }

    async connectedCallback() {
        await this.loadPromotions();
    }

    async loadPromotions() {
        const response = await PromotionService.getPromotions();
        this.promotions = response.data || []; // ✅ ดึง `data` จาก response
        this.render();
    }

    setErrorState(message) {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    ${message}
                </div>
            </div>
        `;
    }

    render() {
        if (!this.promotions || this.promotions.length === 0) {
            this.innerHTML = `
                <div class="container mx-auto px-4 py-16">
                    <p class="text-center text-gray-500">ไม่มีโปรโมชั่นในขณะนี้</p>
                </div>
            `;
            return;
        }

        this.innerHTML = `
            <div class="container mx-auto px-4 py-16">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${this.promotions.map(promo => `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                             onclick="this.closest('content-promotions').viewPromotionDetails(${promo.id})">
                            <div class="relative h-48">
                                <img src="/mali-clear-clinic/assets/images/${promo.image}" 
                                     alt="${promo.title}"
                                     class="w-full h-full object-cover"
                                     onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                            </div>
                            <div class="p-6">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">${promo.title}</h3>
                                <p class="">${promo.description}</p>
                            </div>
                            <div class="px-6 pb-4">
                                <div class="flex items-center text-blue-600">
                                    <span>ดูรายละเอียดเพิ่มเติม</span>
                                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    viewPromotionDetails(id) {
        window.location.href = `/mali-clear-clinic/pages/promotion-details.html?id=${id}`;
    }
}

customElements.define('promotion-list', ContentPromotions);