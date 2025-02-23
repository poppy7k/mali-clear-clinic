import { openModal, closeModal } from "../../scripts/utils/modal.js";

class ConfirmationModal extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="modal-backdrop" class="fixed inset-0 bg-gray-700 opacity-75 hidden z-60"></div>
            <div id="modal" class="fixed inset-0 flex items-center justify-center hidden z-50">
                <div class="modal-content bg-white rounded-2xl shadow-lg w-96 transform transition-all opacity-0 scale-75">
                    <div class="p-6">
                        <h3 id="modal-title" class="text-xl font-semibold text-gray-900"></h3>
                        <p id="modal-message" class="text-gray-600 mt-2"></p>
                    </div>
                    <div class="flex justify-end gap-4 bg-gray-100 px-6 py-4 rounded-b-2xl">
                        <custom-button 
                            id="cancel-btn"
                            text="ยกเลิก"
                            color="gray-600"
                            bgColor="white"
                            hoverBg="white"
                            hoverText="gray-600"
                            class=""
                        ></custom-button>
                        <custom-button 
                            id="confirm-btn"
                            text="ยืนยัน"
                            color="white"
                            bgColor="red-600"
                            hoverBg="red-500"
                            hoverText="white"
                            class=""
                        ></custom-button>
                    </div>
                </div>
            </div>
        `;

        this.modal = this.querySelector("#modal");
        this.backdrop = this.querySelector("#modal-backdrop");
        this.titleElement = this.querySelector("#modal-title");
        this.messageElement = this.querySelector("#modal-message");
        this.cancelButton = this.querySelector("#cancel-btn");
        this.confirmButton = this.querySelector("#confirm-btn");

        this.cancelButton.addEventListener("click", () => this.close());
        this.backdrop.addEventListener("click", () => this.close());

        // แจ้งว่า modal พร้อมใช้งาน
        this.dispatchEvent(new CustomEvent('connected'));
    }

    open(title, message, confirmCallback) {
        this.titleElement.textContent = title;
        this.messageElement.textContent = message;
        this.confirmButton.onclick = () => {
            confirmCallback();
            this.close();
        };
        
        openModal(this.modal);
        openModal(this.backdrop);
    }

    close() {
        closeModal(this.modal);
        closeModal(this.backdrop);
    }
}

customElements.define("confirmation-modal", ConfirmationModal);