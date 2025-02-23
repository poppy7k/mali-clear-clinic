export class ToastManager {
    constructor() {
        this.toasts = [];
        this.id = 0;
    }

    addToast(type, title, message) {
        console.log("🔍 Debug Toast Input:", { type, title, message });

        if (!title || !message) {
            console.error("❌ Toast Error: title หรือ message ว่าง");
            return;
        }

        title = sanitizeText(title);
        message = sanitizeText(message);

        console.log("✅ After Sanitize:", { type, title, message });

        try {
            const newToast = { id: ++this.id, type, title, message };
            this.toasts.push(newToast);
            this.updateUI();

            setTimeout(() => this.removeToast(newToast.id), 4000);
        } catch (error) {
            console.error("❌ Toast Error: ไม่สามารถเพิ่ม Toast ได้", error);
        }
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

// ป้องกันอักขระผิดปกติที่อาจทำให้เกิด InvalidCharacterError
function sanitizeText(text) {
    if (typeof text !== "string" || !text.trim()) return "ข้อมูลไม่ถูกต้อง";
    return text
        .normalize("NFKD")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/[^\w\sก-๙.,!?'"()\[\]{}<>:;-]/g, "");
}

// สร้างอินสแตนซ์ของ ToastManager
export const toastManager = new ToastManager();