class Promotions extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await this.loadPromotions();
    }

    async loadPromotions() {
        try {
            console.log('Loading promotions...');
            const response = await fetch('/mali-clear-clinic/api/Promotion.php');
            const result = await response.json();
            console.log('Promotions result:', result);
            
            if (result.status === 'success') {
                this.renderPromotions(result.data);
            } else {
                console.error('Failed to load promotions:', result.message);
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
        }
    }

    renderPromotions(promotions) {
        this.innerHTML = `
            <div class="container mx-auto py-8">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Promotions</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${promotions.map(promo => `
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