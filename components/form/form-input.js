class FormInput extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const type = this.getAttribute("type") || "text";
        const id = this.getAttribute("id") || "";
        const name = this.getAttribute("name") || "";
        const placeholder = this.getAttribute("placeholder") || "";
        const value = this.getAttribute("value") || "";
        const required = this.hasAttribute("required") ? "required" : "";
        const additionalClass = this.getAttribute("class") || "";

        if (type === "textarea") {
            this.innerHTML = `
                <textarea id="${id}" 
                          name="${name}" 
                          placeholder="${placeholder}" 
                          class="w-full my-2 px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 transition-all duration-300 outline-none ${additionalClass}" 
                          ${required}>${value}</textarea>
            `;
        } else {
            this.innerHTML = `
                <input type="${type}" 
                       id="${id}" 
                       name="${name}" 
                       placeholder="${placeholder}" 
                       value="${value}" 
                       class="w-full my-2 px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 transition-all duration-300 outline-none ${additionalClass}" 
                       ${required}>
            `;
        }
    }
}

customElements.define("form-input", FormInput);
