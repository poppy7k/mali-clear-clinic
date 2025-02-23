import { PromotionService } from '../../services/PromotionService.js';

class ContentPromotionDetails extends HTMLElement {
    constructor() {
        super();
        this.promotion = null;
    }

    async connectedCallback() {
        this.setLoadingState();
        await this.loadPromotionDetails();
    }

    async setLoadingState() {
        try {
            const response = await fetch('/mali-clear-clinic/assets/icons/loading.html');
            const loadingIcon = response.ok ? await response.text() : '<p>กำลังโหลด...</p>';
            
            this.innerHTML = `
                <div class="flex justify-center items-center py-8">
                    ${loadingIcon}
                </div>
            `;
        } catch (error) {
            console.error('Error loading loading icon:', error);
            this.innerHTML = `<p class="text-gray-700 opacity-75">กำลังโหลดสินค้า...</p>`;
        }
    } 

    async loadPromotionDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
            this.showError('ไม่พบรหัสโปรโมชั่น');
            return;
        }

        try {
            const response = await PromotionService.getPromotionById(id);
            this.promotion = response.data || []; // ✅ ดึง `data` จาก response
            console.log(response.data)
            this.render();
        } catch (error) {
            console.error('Error loading promotion details:', error);
            this.showError('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้');
        }
    }

    showError(message) {
        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    ${message}
                </div>
            </div>
        `;
    }

    render() {
        if (!this.promotion) return;

        this.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800">รายละเอียดโปรโมชั่น</h2>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <img src="/mali-clear-clinic/assets/images/${this.promotion.image}" 
                                     alt="${this.promotion.title}"
                                     class="w-full h-64 object-cover rounded-lg"
                                     onerror="this.onerror=null;this.src='/mali-clear-clinic/assets/images/default-image.jpg';">
                            </div>
                            <div>
                                <h3 class="text-xl font-semibold mb-4">${this.promotion.title}</h3>
                                <p class="text-gray-600 mb-6">${this.promotion.description}</p>

                            </div>
                        </div>
                        <div class="mt-8">
                            <custom-button 
                                text="จองคิว"
                                color="white"
                                bgColor="green-600"
                                hoverBg="green-500"
                                icon=""
                                onclick="window.location.href='/mali-clear-clinic/pages/booking.html'"
                                class="w-full">
                            </custom-button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('content-promotion-details', ContentPromotionDetails); 