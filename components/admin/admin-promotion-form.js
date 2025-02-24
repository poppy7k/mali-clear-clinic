import { getUserSession } from '../../scripts/auth/userSession.js';
import { PromotionService } from '../../services/PromotionService.js';
import { ProductService } from '../../Services/ProductService.js';
import { toastManager } from '../../scripts/utils/toast.js';

class AdminPromotionForm extends HTMLElement {
    constructor() {
        super();
        this.promotionId = null;
        this.promotionImage = null;
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user || user.role !== 'ADMIN') {
                window.location.href = '/mali-clear-clinic/index.html';
                return;
            }
    
            // ✅ ดึง `id` จาก URL
            const urlParams = new URLSearchParams(window.location.search);
            this.promotionId = urlParams.get("id");

            // ✅ Render ฟอร์มก่อนโหลดข้อมูล
            this.render();
            this.setupEventListeners();
    
            // ✅ ถ้ามี `id` แสดงว่าเป็นการแก้ไข → โหลดข้อมูล
            if (this.promotionId) {
                await this.loadPromotionData();
            }
    
        } catch (error) {
            console.error('Error:', error);
            toastManager.addToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }

    async loadPromotionData() {
        try {
            console.log("🔹 Debug: Loading promotion ID =", this.promotionId);
    
            // ✅ ใช้ `PromotionService` แทน `fetch()`
            const data = await PromotionService.getPromotionById(this.promotionId);

            if (!data || data.status !== 'success') {
                console.error("❌ Debug: Failed to load promotion", data);
                toastManager.addToast("error", "ข้อผิดพลาด", "ไม่พบโปรโมชั่นที่ต้องการแก้ไข");
                return;
            }

            const promotion = data.data;
            console.log("✅ Debug: Loaded promotion data:", promotion);
    
            // ✅ เติมค่าลงในฟอร์ม
            this.querySelector('form-input[name="title"] input').value = promotion.title;
            this.querySelector('rich-text-editor').setContent(promotion.description);

            // ✅ ถ้ามีรูปภาพเดิม ให้แสดง
            if (promotion.image) {
                this.promotionImage = promotion.image;

                const imagePreview = document.createElement("img");
                imagePreview.src = `/mali-clear-clinic/assets/images/${promotion.image}`;
                imagePreview.className = "mt-2 w-40 rounded shadow";

                const fileInput = this.querySelector("form-input[name='image']");
                fileInput.insertAdjacentElement("afterend", imagePreview);
            }

            // ✅ เปลี่ยนหัวข้อเป็น "แก้ไขโปรโมชั่น"
            this.querySelector("#form-title").textContent = "แก้ไขโปรโมชั่น";

        } catch (error) {
            console.error("❌ Error loading promotion:", error);
            toastManager.addToast("error", "ข้อผิดพลาด", "เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น");
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="form-title" class="text-2xl font-bold">สร้างโปรโมชั่นใหม่</h2>
                </div>
    
                <form id="promotion-form" class="bg-white border border-gray-200 shadow-md rounded-lg p-6">
                    <div class="grid grid-cols-1 gap-6">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">ชื่อโปรโมชั่น *</label>
                            <form-input 
                                type="text"
                                name="title"
                                required>
                            </form-input>
                        </div>
    
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">รายละเอียด *</label>
                            <rich-text-editor name="description"></rich-text-editor>
                        </div>
    
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">รูปภาพ</label>
                            <form-input 
                                type="file"
                                name="image"
                                accept="image/*">
                            </form-input>
                            <p class="text-sm text-gray-500 mt-1">หากไม่เลือก จะใช้รูปเดิม</p>
                        </div>
    
                        <div class="flex justify-end space-x-4">
                            <custom-button 
                                text="ยกเลิก"
                                color="white"
                                bgColor="gray-600"
                                hoverBg="gray-500"
                                type="button"
                                id="back-btn"
                                class="w-auto">
                            </custom-button>
                            <custom-button 
                                text="บันทึก"
                                color="white"
                                bgColor="green-600"
                                hoverBg="green-500"
                                type="submit"
                                class="w-auto">
                            </custom-button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.querySelector('#promotion-form');
        const backBtn = this.querySelector('#back-btn');

        form.addEventListener('submit', this.handleSubmit.bind(this));
        backBtn.addEventListener('click', () => this.navigateBack());
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
    
            formData.delete('title');
            formData.delete('description');
    
            const titleValue = this.querySelector('form-input[name="title"] input')?.value || '';
            const descriptionValue = this.querySelector('rich-text-editor').getContent();
    
            formData.append('title', titleValue);
            formData.append('description', descriptionValue);

            // ✅ ถ้าไม่มีไฟล์ใหม่ให้แนบ `image` เดิม
            const imageInput = this.querySelector("input[name='image']");
            if (!imageInput.files.length && this.promotionId && this.promotionImage) {
                formData.append('current_image', this.promotionImage);
            }
    
            if (this.promotionId) {
                console.log("🔹 Debug: Updating promotion ID:", this.promotionId);
                const response = await PromotionService.updatePromotion(this.promotionId, formData);
                if (response) {
                    this.navigateBack();
                    toastManager.addToast("success", "สำเร็จ", "แก้ไขโปรโมชั่นเรียบร้อยแล้ว");
                } else {
                    toastManager.addToast("error", "ข้อผิดพลาด", "ไม่สามารถอัปเดตโปรโมชั่นได้");
                }
                return;
            }
    
            // ✅ ถ้าไม่มี `id` → ใช้ `createPromotion()` (POST)
            console.log("🔹 Debug: Creating new promotion...");
            const response = await PromotionService.createPromotion(formData);
            if (response) {
                toastManager.addToast("success", "สำเร็จ", "สร้างโปรโมชั่นเรียบร้อยแล้ว");
                this.navigateBack();
            } else {
                toastManager.addToast("error", "ข้อผิดพลาด", "ไม่สามารถสร้างโปรโมชั่นได้");
            }
    
        } catch (error) {
            console.error("❌ Error saving promotion:", error);
            toastManager.addToast("error", "ข้อผิดพลาด", "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    }

    navigateBack() {
        window.location.href = '/mali-clear-clinic/pages/admin-promotions.html';
    }
}

customElements.define('admin-promotion-form', AdminPromotionForm); 