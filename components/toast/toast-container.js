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
        // เคลียร์เนื้อหาทั้งหมดก่อน
        this.innerHTML = "";

        toasts.forEach((toast) => {
            // สร้าง div หลักของ Toast
            const toastElement = document.createElement("div");

            // เพิ่มคลาสหลัก
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
                    "transform",
                    "transition-all",
                    "duration-500",
                    "ease-out",
                    "border-2"
                ]
            );

            // เพิ่มคลาสจากฟังก์ชัน getToastStyle() โดย split เป็นอาเรย์
            const styleClasses = this.getToastStyle(toast.type).split(" ");
            toastElement.classList.add(...styleClasses);

            // สร้าง Icon
            const iconElement = this.getToastIconElement(toast.type);

            // สร้าง Title
            const titleElement = document.createElement("h3");
            titleElement.classList.add("font-bold", "max-w-52", "truncate");
            titleElement.textContent = toast.title;

            // สร้างข้อความ
            const messageElement = document.createElement("p");
            messageElement.classList.add("max-w-52");
            messageElement.textContent = toast.message;

            // จัดกลุ่ม (icon + text)
            const textContainer = document.createElement("div");
            textContainer.classList.add("flex", "items-start");

            const toastDetails = document.createElement("div");
            toastDetails.classList.add("ml-4");

            toastDetails.appendChild(titleElement);
            toastDetails.appendChild(messageElement);

            textContainer.appendChild(iconElement);
            textContainer.appendChild(toastDetails);

            // ปุ่มปิด
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

            // ใส่ส่วนประกอบทั้งหมดลงใน toastElement
            toastElement.appendChild(textContainer);
            toastElement.appendChild(closeButton);

            // ใส่ Toast ที่สร้างเสร็จลงใน <toast-container>
            this.appendChild(toastElement);

            // Animation เปิด Toast
            toastElement.style.opacity = "0";
            toastElement.style.transform = "translateY(20px) scale(0.9)";
            setTimeout(() => {
                toastElement.style.opacity = "1";
                toastElement.style.transform = "translateY(0) scale(1)";
            }, 100);
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
    getToastIconElement(type) {
        const iconWrapper = document.createElement("div");
        iconWrapper.classList.add("rounded-full", "px-2", "py-2");

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "h-4 w-4 text-white");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("viewBox", "0 0 24 24");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        switch (type) {
            case "success":
                iconWrapper.classList.add("bg-green-600");
                path.setAttribute("d", "M9 16.2l-4.2-4.2 1.4-1.4L9 13.4l6.8-6.8 1.4 1.4z");
                break;
            case "danger":
                iconWrapper.classList.add("bg-red-600");
                path.setAttribute("d", "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z");
                break;
            case "info":
                iconWrapper.classList.add("bg-blue-600");
                path.setAttribute("d", "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2v6zm-2-8V7h2v2h-2z");
                break;
            case "warning":
                iconWrapper.classList.add("bg-yellow-600");
                path.setAttribute("d", "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2v2zm-2-4v-6h2v6h-2z");
                break;
            default:
                iconWrapper.classList.add("bg-gray-600");
                path.setAttribute("d", "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z");
                break;
        }

        svg.appendChild(path);
        iconWrapper.appendChild(svg);
        return iconWrapper;
    }
}

customElements.define("toast-container", ToastContainer);
