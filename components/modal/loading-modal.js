class LoadingModal extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div id="loading-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black opacity-50"></div>
                <div class="modal-content flex items-center justify-center min-h-screen">
                    <svg class="animate-spin w-10 h-10 fill-gray-900 opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"/>
                    </svg> 
                </div>
            </div>
        `;
    }

    show() {
        const modal = this.querySelector('#loading-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hide() {
        const modal = this.querySelector('#loading-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

customElements.define('loading-modal', LoadingModal); 