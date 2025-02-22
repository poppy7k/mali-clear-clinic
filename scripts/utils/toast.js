export class ToastManager {
    constructor() {
        this.toasts = [];
        this.id = 0;
    }

    addToast(type, title, message) {
        const newToast = { id: ++this.id, type, title, message };
        this.toasts.push(newToast);
        this.updateUI();

        // ลบ Toast ออกจากรายการอัตโนมัติหลัง 4 วินาที
        setTimeout(() => this.removeToast(newToast.id), 4000);
    }

    removeToast(id) {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
        this.updateUI();
    }

    updateUI() {
        const toastContainer = document.querySelector("toast-container");
        if (toastContainer) {
            toastContainer.renderToasts(this.toasts);
        }
    }
}

// สร้างอินสแตนซ์ของ ToastManager
export const toastManager = new ToastManager();