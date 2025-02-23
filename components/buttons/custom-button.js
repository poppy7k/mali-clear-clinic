class CustomButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const text = this.getAttribute("text") || "Button";
        const color = this.getAttribute("color") || "gray-700";
        const icon = this.getAttribute("icon") || "";
        const href = this.getAttribute("href") || ""; 
        const hoverBg = this.getAttribute("hoverBg") || "yellow-50";
        const hoverText = this.getAttribute("hoverText") || "black";
        const id = this.getAttribute("id") || "";
        const addClass = this.getAttribute("class") || "";
        const bgColor = this.getAttribute("bgColor") || "white";
        const type = this.getAttribute("type") || "button"; 
        const align = this.getAttribute("align") || "center";

        // โหลด SVG จากไฟล์ HTML
        const iconUrl = `/mali-clear-clinic/assets/icons/${icon}.html`;

        if (icon) {
            fetch(iconUrl)
                .then(response => response.text())
                .then(svgContent => {
                    this.renderButton(svgContent, text, color, href, hoverBg, hoverText, id, addClass, bgColor, type, align);
                })
                .catch(err => {
                    console.error("Error loading SVG:", err);
                    this.renderButton('', text, color, href, hoverBg, hoverText, id, addClass, bgColor, type, align);
                });
        } else {
            this.renderButton('', text, color, href, hoverBg, hoverText, id, addClass, bgColor, type, align);
        }
    }

    renderButton(iconHtml, text, color, href, hoverBg, hoverText, id, addClass, bgColor, type, align) {
        this.innerHTML = `
            <button 
                type="${type}" 
                id="${id}" 
                class="${addClass} bg-${bgColor} flex items-center text-${color} fill-${color} gap-2 py-2 px-4 rounded-lg font-semibold transition-all duration-300 hover:bg-${hoverBg} hover:text-${hoverText} cursor-pointer ${align === 'left' ? 'justify-start' : 'justify-center'}">
                ${iconHtml ? `<span class="h-5 w-5">${iconHtml}</span>` : ''}
                <span>${text}</span>
            </button>
        `;

        // ป้องกัน Redirect ถ้าไม่มี `href`
        if (href) {
            this.querySelector("button").addEventListener("click", () => {
                window.location.href = href;
            });
        }
    }
}

// ลงทะเบียน Custom Element
customElements.define("custom-button", CustomButton);
