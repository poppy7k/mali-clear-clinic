class ProductServiceList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = "";
        this.selectedType = "all"; // เพิ่ม state สำหรับเก็บประเภทที่เลือก
    }

    async connectedCallback() {
        this.innerHTML = `
            <div class="container mx-auto py-2">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Our Products and Services</h2>
                
                <div class="flex gap-6">
                    <!-- Filters Section -->
                    <div class="w-1/4 bg-white rounded-lg shadow-md p-4">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3 text-gray-800">ประเภท</h3>
                            <div class="flex flex-col space-y-2">
                                <button class="type-btn text-left px-4 py-2 rounded hover:bg-yellow-50 transition-colors ${this.selectedType === 'all' ? 'bg-yellow-100 text-yellow-700' : ''}" 
                                        data-type="all">
                                    🏷️ ทั้งหมด
                                </button>
                                <button class="type-btn text-left px-4 py-2 rounded hover:bg-yellow-50 transition-colors ${this.selectedType === 'SERVICE' ? 'bg-yellow-100 text-yellow-700' : ''}" 
                                        data-type="SERVICE">
                                    💆‍♀️ บริการ
                                </button>
                                <button class="type-btn text-left px-4 py-2 rounded hover:bg-yellow-50 transition-colors ${this.selectedType === 'PRODUCT' ? 'bg-yellow-100 text-yellow-700' : ''}" 
                                        data-type="PRODUCT">
                                    🛍️ สินค้า
                                </button>
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

        // เพิ่ม Event Listeners
        this.setupEventListeners();
        
        // ใช้ MutationObserver สำหรับ category-list
        this.setupCategoryObserver();

        await this.fetchProducts();
    }

    setupEventListeners() {
        const typeButtons = this.querySelectorAll('.type-btn');
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // อัปเดต UI ของปุ่ม
                typeButtons.forEach(b => {
                    b.classList.remove('bg-yellow-100', 'text-yellow-700');
                });
                btn.classList.add('bg-yellow-100', 'text-yellow-700');
                
                // อัปเดต state และโหลดข้อมูลใหม่
                this.selectedType = btn.dataset.type;
                this.fetchProducts();
            });
        });
    }

    setupCategoryObserver() {
        const observer = new MutationObserver(() => {
            this.filterList = this.querySelector("category-list");
            if (this.filterList) {
                this.filterList.setCategorySelectedCallback((categoryId) => {
                    this.selectedCategory = categoryId;
                    // เรียก fetchProducts โดยใช้ทั้ง selectedCategory และ selectedType
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
            
            // ตรวจสอบและเพิ่มพารามิเตอร์ทั้ง category และ type
            if (this.selectedCategory) {
                params.append('category_id', this.selectedCategory);
            }
            // แก้ไขเงื่อนไขการเพิ่ม type parameter
            if (this.selectedType && this.selectedType !== 'all') {
                params.append('type', this.selectedType);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log('Fetching URL:', url); // เพิ่ม log เพื่อตรวจสอบ URL

            const response = await fetch(url);
            const result = await response.json();

            if (result.status === "success") {
                this.renderProducts(result.data);
            } else {
                this.showNoProductsMessage();
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            this.showNoProductsMessage();
        }
    }

    renderProducts(products) {
        const productList = this.querySelector('#productServiceList');
        if (!products || products.length === 0) {
            this.showNoProductsMessage();
            return;
        }

        productList.innerHTML = products.map(product => {
            const card = document.createElement('product-card');
            card.data = product;
            return card.outerHTML;
        }).join('');

        // อัปเดต data หลังจาก render
        products.forEach(product => {
            const card = this.querySelector(`product-card[id="product-${product.id}"]`);
            if (card) {
                card.data = product;
            }
        });
    }

    showNoProductsMessage() {
        const productList = this.querySelector('#productServiceList');
        productList.innerHTML = `
            <div class="col-span-full text-center text-gray-500 py-8">
                ไม่พบสินค้าหรือบริการในหมวดหมู่ที่เลือก
            </div>
        `;
    }
}

customElements.define('product-list', ProductServiceList);
