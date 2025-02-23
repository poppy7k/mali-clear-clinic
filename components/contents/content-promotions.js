import { PromotionService } from '../../services/PromotionService.js';

class Promotions extends HTMLElement {
    constructor() {
        super();
        this.promotions = [];
    }

    async connectedCallback() {
        this.setLoadingState(); // ✅ แสดง Loading ระหว่างดึงข้อมูล
        try {
            this.promotions = await PromotionService.getPromotions();
            this.render();
        } catch (error) {
            console.error("Error fetching promotions:", error);
            this.setErrorState("ไม่สามารถโหลดโปรโมชั่นได้ กรุณาลองใหม่");
        }
    }

    async setLoadingState() {
        try {
            const response = await fetch('/mali-clear-clinic/assets/icons/loading.html');
            const loadingIcon = response.ok ? await response.text() : '<p>กำลังโหลด...</p>';
            
            this.innerHTML = `
                <div class="container mx-auto py-8 text-center">
                    <h2 class="text-3xl font-bold text-gray-800 mb-8">Promotions</h2>
                    <div class="flex justify-center items-center">
                        ${loadingIcon}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading loading icon:', error);
            this.innerHTML = `
                <div class="container mx-auto py-8 text-center">
                    <h2 class="text-3xl font-bold text-gray-800 mb-8">Promotions</h2>
                    <p class="text-gray-700 opacity-75">กำลังโหลดโปรโมชั่น...</p>
                </div>
            `;
        }
    }    

    setErrorState(message) {
        this.innerHTML = `
            <div class="container mx-auto py-8 text-center">
                <h2 class="text-3xl font-bold text-gray-800 mb-8">Promotions</h2>
                <p class="text-red-600">${message}</p>
            </div>
        `;
    }

    render() {
        if (!this.promotions || this.promotions.length === 0) {
            this.setErrorState("ไม่มีโปรโมชั่นในขณะนี้");
            return;
        }

        this.innerHTML = `
            <div class="container mx-auto py-8">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Promotions</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${this.promotions.map(promo => `
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">${promo.title}</h3>
                            <img src="/mali-clear-clinic/assets/images/${promo.image}" 
                                alt="${promo.title}" 
                                class="w-full h-48 object-cover rounded-lg mb-4">
                            <p class="text-gray-600">${promo.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

customElements.define('content-promotions', Promotions);
