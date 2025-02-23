class ProductServiceList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = "";
        this.selectedType = "all";
        this.innerHTML = `
            <div class="container mx-auto py-2 z-10">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Our Products and Services</h2>
                
                <div class="flex gap-6">
                    <!-- Filters Section -->
                    <div class="w-1/4 bg-white rounded-lg shadow-md p-4">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">ประเภท</h3>
                            <div class="flex flex-col space-y-2">
                                <custom-button 
                                    class="type-btn w-full"
                                    text="ทั้งหมด"
                                    color="${this.selectedType === 'all' ? 'yellow-700' : 'gray-700'}"
                                    bgColor="${this.selectedType === 'all' ? 'yellow-100' : 'white'}"
                                    hoverBg="yellow-50"
                                    data-type="all"
                                    icon="grid"
                                    align="left">
                                </custom-button>
                                <custom-button 
                                    class="type-btn w-full"
                                    text="บริการ"
                                    color="${this.selectedType === 'SERVICE' ? 'yellow-700' : 'gray-700'}"
                                    bgColor="${this.selectedType === 'SERVICE' ? 'yellow-100' : 'white'}"
                                    hoverBg="yellow-50"
                                    data-type="SERVICE"
                                    icon="clock"
                                    align="left">
                                </custom-button>
                                <custom-button 
                                    class="type-btn w-full"
                                    text="สินค้า"
                                    color="${this.selectedType === 'PRODUCT' ? 'yellow-700' : 'gray-700'}"
                                    bgColor="${this.selectedType === 'PRODUCT' ? 'yellow-100' : 'white'}"
                                    hoverBg="yellow-50"
                                    data-type="PRODUCT"
                                    icon="shopping-bag"
                                    align="left">
                                </custom-button>
                            </div>
                        </div>

                        <div class="border-t pt-4">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">หมวดหมู่</h3>
                            <category-list class="flex flex-col"></category-list>
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <div class="w-3/4 z-10">
                        <div id="productServiceList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 z-10">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // เพิ่ม Event Listeners
        this.setupEventListeners();
        
        // ใช้ MutationObserver สำหรับ category-list
        this.setupCategoryObserver();
    }

    async connectedCallback() {
        await this.fetchProducts();
    }

    setupEventListeners() {
        const typeButtons = this.querySelectorAll('.type-btn');
        typeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.selectedType = type;
                this.fetchProducts();
                this.render();
            });
        });
    }

    setupCategoryObserver() {
        const observer = new MutationObserver(() => {
            this.filterList = this.querySelector("category-list");
            if (this.filterList) {
                this.filterList.setCategorySelectedCallback((categoryId) => {
                    this.selectedCategory = categoryId;
                    this.fetchProducts();
                });
                observer.disconnect();
            }
        });
        observer.observe(this, { childList: true, subtree: true });
    }

    async fetchProducts() {
        try {
            let url = "/mali-clear-clinic/api/product/Product.php";
            const params = new URLSearchParams();
            
            if (this.selectedCategory) {
                params.append('category_id', this.selectedCategory);
            }
            if (this.selectedType && this.selectedType !== 'all') {
                params.append('type', this.selectedType);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.status === "success") {
                this.products = result.data;
                this.renderProducts();
                this.assignProductData();
            } else {
                this.showNoProductsMessage();
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            this.showNoProductsMessage();
        }
    }

    renderProducts() {
        const productList = this.querySelector('#productServiceList');
        if (!this.products || this.products.length === 0) {
            this.showNoProductsMessage();
            return;
        }

        productList.innerHTML = this.products.map(product => {
            const card = document.createElement('product-card');
            card.data = product;
            return card.outerHTML;
        }).join('');
    }

    assignProductData() {
        const cards = this.querySelectorAll('product-card');
        cards.forEach((card, index) => {
            if (this.products[index]) {
                card.data = this.products[index]; // กำหนดข้อมูล product
            }
        });
    }

    showNoProductsMessage() {
        const productList = this.querySelector('#productServiceList');
        productList.innerHTML = ` <div class="col-span-full text-center text-gray-500 py-8">
                ไม่พบสินค้าหรือบริการในหมวดหมู่ที่เลือก
            </div>
        `;
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto py-2">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Our Products and Services</h2>
                
                <div class="flex gap-6">
                    <!-- Filters Section -->
                    <div class="w-1/4 bg-white rounded-lg shadow-md p-4">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">ประเภท</h3>
                            <div class="flex flex-col space-y-2">
                                <custom-button 
                                    class="type-btn w-full"
                                    text="ทั้งหมด"
                                    color="${this.selectedType === 'all' ? 'yellow-700' : 'gray-700'}"
                                    bgColor="${this.selectedType === 'all' ? 'yellow-100' : 'white'}"
                                    hoverBg="yellow-50"
                                    data-type="all"
                                    icon="grid"
                                    align="left">
                                </custom-button>

                                <custom-button 
                                    class="type-btn w-full"
                                    text="บริการ"
                                    color="${this.selectedType === 'SERVICE' ? 'yellow-700' : 'gray-700'}"
                                    bgColor="${this.selectedType === 'SERVICE' ? 'yellow-100' : 'white'}"
                                    hoverBg="yellow-50"
                                    data-type="SERVICE"
                                    icon="clock"
                                    align="left">
                                </custom-button>

                                <custom-button 
                                    class="type-btn w-full"
                                    text="สินค้า"
                                    color="${this.selectedType === 'PRODUCT' ? 'yellow-700' : 'gray-700'}"
                                    bgColor="${this.selectedType === 'PRODUCT' ? 'yellow-100' : 'white'}"
                                    hoverBg="yellow-50"
                                    data-type="PRODUCT"
                                    icon="shopping-bag"
                                    align="left">
                                </custom-button>
                            </div>
                        </div>

                        <div class="border-t pt-4">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">หมวดหมู่</h3>
                            <category-list class="flex flex-col"></category-list>
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <div class="w-3/4">
                        <div id="productServiceList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ตั้งค่า event listeners หลังจาก render
        this.setupEventListeners();
        this.setupCategoryObserver();
    }
}

customElements.define('product-list', ProductServiceList);
