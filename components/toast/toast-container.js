import { toastManager } from "./toast.js";

class ToastContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add("fixed", "bottom-6", "right-6", "z-50", "space-y-4");
    }

    renderToasts(toasts) {
        this.innerHTML = "";

        toasts.forEach((toast) => {
            const toastElement = document.createElement("div");
            toastElement.className =
                "flex items-center justify-between rounded-2xl px-4 py-3 bg-white shadow-lg transform transition-all duration-500 ease-out border-2";
            toastElement.classList.add(this.getToastStyle(toast.type));
            toastElement.innerHTML = `
                <div class="flex items-start">
                    ${this.getToastIcon(toast.type)}
                    <div class="ml-4">
                        <h3 class="font-bold max-w-52 truncate">${toast.title}</h3>
                        <div class="max-w-52"> 
                            <p>${toast.message}</p>
                        </div>
                    </div>
                </div>
                <button class="ml-4 text-xs cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            `;

            // Animation เปิด
            toastElement.style.opacity = "0";
            toastElement.style.transform = "translateY(20px) scale(0.9)";
            setTimeout(() => {
                toastElement.style.opacity = "1";
                toastElement.style.transform = "translateY(0) scale(1)";
            }, 100);

            // Animation ปิดเมื่อกดปุ่ม
            toastElement.querySelector("button").addEventListener("click", () => {
                toastElement.style.opacity = "0";
                toastElement.style.transform = "translateX(100px) scale(0.9)";
                setTimeout(() => {
                    toastManager.removeToast(toast.id);
                }, 300);
            });

            this.appendChild(toastElement);
        });
    }

    getToastStyle(type) {
        return {
            success: "text-black border-green-500",
            danger: "text-black border-red-500",
            info: "text-black border-blue-500",
            warning: "text-black border-yellow-500",
        }[type] || "text-black border-gray-500";
    }

    getToastIcon(type) {
        const icons = {
            success: `<div class="rounded-full bg-green-600 px-2 py-2"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2l-4.2-4.2 1.4-1.4L9 13.4l6.8-6.8 1.4 1.4z"/></svg></div>`,
            danger: `<div class="rounded-full bg-red-600 px-2 py-2"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg></div>`,
            info: `<div class="rounded-full bg-blue-600 px-2 py-2"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2v6zm-2-8V7h2v2h-2z"/></svg></div>`,
            warning: `<div class="rounded-full bg-yellow-600 px-2 py-2"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2v2zm-2-4v-6h2v6h-2z"/></svg></div>`,
        };
        return icons[type] || "";
    }
}

customElements.define("toast-container", ToastContainer);