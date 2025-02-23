import { toastManager } from "../../scripts/utils/toast.js";

class ToastContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add("fixed", "bottom-6", "right-6", "z-50", "space-y-4");
    }

    renderToasts(toasts) {
        this.innerHTML = ""; // ล้าง Toast เก่าออกก่อน

        toasts.forEach((toast) => {
            const toastElement = document.createElement("div");
            toastElement.className =
                "flex items-center justify-between rounded-2xl px-4 py-3 bg-white shadow-lg transform transition-all duration-500 ease-out border-2";
            toastElement.classList.add(this.getToastStyle(toast.type));

            const messageElement = document.createElement("p");
            messageElement.className = "max-w-52";
            messageElement.textContent = toast.message;

            const toastContent = document.createElement("div");
            toastContent.className = "ml-4";
            toastContent.appendChild(titleElement);
            toastContent.appendChild(messageElement);

            // ปุ่มปิด Toast
            const closeButton = document.createElement("button");
            closeButton.className = "ml-4 text-xs cursor-pointer";
            closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
            closeButton.addEventListener("click", () => {
                toastElement.style.opacity = "0";
                toastElement.style.transform = "translateX(100px) scale(0.9)";
                setTimeout(() => {
                    toastManager.removeToast(toast.id);
                }, 300);
            });

            toastElement.appendChild(closeButton);
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