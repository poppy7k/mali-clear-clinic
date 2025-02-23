import { toastManager } from "../../scripts/utils/toast.js";

class ToastContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // เพิ่มคลาสเบื้องต้นด้วยการ split แล้วใช้ ...
        this.classList.add(
            ...["fixed", "bottom-6", "right-6", "z-50", "space-y-4"]
        );
    }

    renderToasts(toasts) {
        const newToastIds = toasts.map(t => t.id);
        const existingElements = Array.from(this.children);
    
        // 1️⃣ ลบ Toast ที่ไม่มีอยู่ใน newToastIds (ใช้ Transition)
        existingElements.forEach(el => {
            const currentId = Number(el.dataset.toastId);
            if (!newToastIds.includes(currentId)) {
                el.style.opacity = "0";
                el.style.transform = "translateX(100px) scale(0.9)";
                setTimeout(() => this.removeChild(el), 300); // 300ms ให้เวลา transition
            }
        });
    
        // 2️⃣ เพิ่ม Toast ที่ยังไม่มีใน DOM พร้อมทำ Transition
        toasts.forEach(async toast => {
            const found = existingElements.some(el => Number(el.dataset.toastId) === toast.id);
            if (!found) {
                const toastElement = document.createElement("div");
                toastElement.dataset.toastId = toast.id;
                toastElement.classList.add(
                    ...[
                        "flex",
                        "items-center",
                        "justify-between",
                        "rounded-2xl",
                        "px-4",
                        "py-3",
                        "bg-white",
                        "shadow-lg",
                        "border-2",
                        "transition-all",
                        "duration-500",
                        "ease-out",
                    ]
                );
    
                const styleClasses = this.getToastStyle(toast.type).split(" ");
                toastElement.classList.add(...styleClasses);
    
                // Icon
                const iconElement = await this.getToastIconElement(toast.type);
    
                // Title
                const titleElement = document.createElement("h3");
                titleElement.classList.add("font-bold", "max-w-52", "truncate");
                titleElement.textContent = toast.title;
    
                // Message
                const messageElement = document.createElement("p");
                messageElement.classList.add("max-w-52");
                messageElement.textContent = toast.message;
    
                // Group Text
                const toastDetails = document.createElement("div");
                toastDetails.classList.add("ml-4");
                toastDetails.appendChild(titleElement);
                toastDetails.appendChild(messageElement);
    
                const textContainer = document.createElement("div");
                textContainer.classList.add("flex", "items-center", );
                textContainer.appendChild(iconElement);
                textContainer.appendChild(toastDetails);
    
                // Close Button
                const closeButton = document.createElement("button");
                closeButton.classList.add("ml-4", "text-xs", "cursor-pointer");
                closeButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg"
                         class="h-6 w-6" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                `;
                closeButton.addEventListener("click", () => {
                    toastElement.style.opacity = "0";
                    toastElement.style.transform = "translateX(100px) scale(0.9)";
                    setTimeout(() => {
                        toastManager.removeToast(toast.id);
                    }, 300);
                });
    
                toastElement.appendChild(textContainer);
                toastElement.appendChild(closeButton);
    
                // 🔥 Animation เข้า (เริ่มต้นที่ opacity 0 แล้วค่อย fade-in)
                toastElement.style.opacity = "0";
                toastElement.style.transform = "translateY(20px) scale(0.9)";
    
                this.appendChild(toastElement);
    
                setTimeout(() => {
                    toastElement.style.opacity = "1";
                    toastElement.style.transform = "translateY(0) scale(1)";
                }, 50);
            }
        });
    }

    /**
     * รับประเภท Toast แล้วคืนเป็นสตริงที่มีคลาส Tailwind
     * NOTE: เราจะ split() ภายหลังแล้วใช้ spread เพิ่มใน classList
     */
    getToastStyle(type) {
        return {
            success: "text-black border-green-500",
            danger:  "text-black border-red-500",
            info:    "text-black border-blue-500",
            warning: "text-black border-yellow-500",
        }[type] || "text-black border-gray-500";
    }

    /**
     * สร้าง Element ของ Icon ตาม type
     */
    async getToastIconElement(type) {
        const iconWrapper = document.createElement("div");
        iconWrapper.classList.add(
            "rounded-full", "px-2", "py-2", "flex", "items-center", "justify-center", "fill-white"
        );
    
        // กำหนด path ของไอคอนที่เป็นไฟล์ HTML
        const iconPaths = {
            success: "/mali-clear-clinic/assets/icons/success.html",
            danger: "/mali-clear-clinic/assets/icons/error.html",
            info: "/mali-clear-clinic/assets/icons/info.html",
            warning: "/mali-clear-clinic/assets/icons/triangle-warning.html"
        };
    
        // กำหนด background color ตามประเภทของ Toast
        const bgColors = {
            success: "bg-green-600",
            danger: "bg-red-600",
            info: "bg-blue-600",
            warning: "bg-yellow-600"
        };
    
        const iconPath = iconPaths[type] || "/mali-clear-clinic/assets/icons/default.html"; // ใช้ default ถ้าไม่ตรงเงื่อนไข
        iconWrapper.classList.add(bgColors[type] || "bg-gray-600"); // ✅ เพิ่ม background color
    
        try {
            // ใช้ Fetch โหลดไฟล์ HTML
            const response = await fetch(iconPath);
            if (!response.ok) throw new Error(`Failed to load icon: ${iconPath}`);
            const htmlText = await response.text();
    
            // สร้าง <div> ชั่วคราวเพื่อแปลง HTML เป็น Node
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = htmlText;
    
            // ดึง Element ไอคอนจากไฟล์ HTML
            const iconElement = tempContainer.firstElementChild;
    
            if (iconElement) {
                iconElement.classList.add("h-5", "w-5"); // ปรับขนาดไอคอนได้
                iconWrapper.appendChild(iconElement);
            } else {
                console.warn("No valid icon element found in:", iconPath);
            }
        } catch (error) {
            console.error("Error loading HTML icon:", error);
        }
    
        return iconWrapper;
    }    
    
}

customElements.define("toast-container", ToastContainer);
