class CategoryList extends HTMLElement {
    constructor() {
        super();
        this.selectedCategory = ""; 
        this.selectedCategoryCallback = null;
    }

    async connectedCallback() {
        this.innerHTML = `
            <div class="bg-white rounded-lg z-10">
                <div class="flex flex-col space-y-2">
                    <custom-button 
                        class="category-btn w-full"
                        text="ทั้งหมด"
                        color="yellow-700"
                        bgColor="yellow-100"
                        hoverBg="yellow-50"
                        data-id=""
                        align="left">
                    </custom-button>
                </div>
            </div>
        `;
        await this.fetchCategories();
        this.addEventListeners();
    }

    async fetchCategories() {
        try {
            const response = await fetch("/mali-clear-clinic/api/category/Category.php");
            const data = await response.json();
            console.log("Fetched Categories:", data);

            if (data.status === "success") {
                const container = this.querySelector(".flex-col");
                data.categories.forEach(category => {
                    if (!category.id) return;
                    const button = document.createElement("custom-button");
                    button.className = "category-btn w-full";
                    button.setAttribute("text", category.name);
                    button.setAttribute("color", "gray-700");
                    button.setAttribute("bgColor", "white");
                    button.setAttribute("hoverBg", "yellow-50");
                    button.setAttribute("data-id", category.id);
                    button.setAttribute("align", "left");
                    container.appendChild(button);
                });
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    addEventListeners() {
        this.addEventListener("click", (event) => {
            const clickedButton = event.target.closest("custom-button"); // ค้นหา `custom-button` ที่ใกล้ที่สุด
            if (!clickedButton) return; // ถ้าไม่ใช่ `custom-button` ให้หยุดทำงาน
    
            this.selectedCategory = clickedButton.getAttribute("data-id") || "";
            console.log("Category selected:", this.selectedCategory);
            this.updateSelectedCategory();
    
            // ส่งค่าที่เลือกไปยัง callback function
            if (this.selectedCategoryCallback) {
                this.selectedCategoryCallback(this.selectedCategory);
            }
        });
    }
    

    updateSelectedCategory() {
        this.querySelectorAll(".category-btn").forEach(btn => {
            if (btn.getAttribute("data-id") === this.selectedCategory) {
                btn.setAttribute("color", "yellow-700");
                btn.setAttribute("bgColor", "yellow-100");
            } else {
                btn.setAttribute("color", "gray-700");
                btn.setAttribute("bgColor", "white");
            }
    
            // ✅ บังคับให้ปุ่มอัปเดต
            const newBtn = btn.cloneNode(true);
            btn.replaceWith(newBtn);
        });
    }
    

    setCategorySelectedCallback(callback) {
        this.selectedCategoryCallback = callback;
    }
}

customElements.define("category-list", CategoryList);
