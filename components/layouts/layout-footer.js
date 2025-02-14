class CustomFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-yellow-400 text-black py-4">
                <div class="container text-center">
                    <div class="row d-flex justify-content-center">
                        <div class="col-md-4">
                            <h5>Contact Us</h5>
                            <button class="btn btn-outline"> sadasdas</button>
                        </div>
                    </div>  
                    <hr class="my-4">
                    <p>&copy; 2025 MaliClearClinic. All rights reserved.</p>
                </div>
            </footer>
        `;
    }
}

customElements.define("layout-footer", CustomFooter);
