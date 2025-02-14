class CustomButton extends HTMLElement {
    constructor() {
        super();
    }

    // การตั้งค่าเมื่อเชื่อมต่อกับ DOM
    connectedCallback() {
        const text = this.getAttribute("text") || "Button";
        const color = this.getAttribute("color") || "gray";
        const icon = this.getAttribute("icon") || "";
        const href = this.getAttribute("href") || "#";
        const hoverBg = this.getAttribute("hoverBg") || color;
        const hoverText = this.getAttribute("hoverText") || "black";
        const id = this.getAttribute("id");
        const addClass = this.getAttribute("class");
        const bgColor = this.getAttribute("bgColor");

        // สร้างตัวแปรสำหรับเก็บ URL ของ SVG
        const iconUrl = `/mali-clear-clinic/assets/icons/${icon}.html`;

        // โหลด SVG ผ่าน fetch()
        if (icon) {
            fetch(iconUrl)
                .then(response => response.text())
                .then(svgContent => {
                    this.renderButton(svgContent, text, color, href, hoverBg, hoverText, id, addClass, bgColor);
                })
                .catch(err => {
                    console.error("Error loading SVG:", err);
                    this.renderButton('', text, color, href, hoverBg, hoverText, id, addClass, bgColor);
                });
        } else {
            this.renderButton('', text, color, href, hoverBg, hoverText, id, addClass, bgColor);
        }
    }

    renderButton(iconHtml, text, color, href, hoverBg, hoverText, id, addClass, bgColor) {
        this.innerHTML = `
            <a href="${href}" id="${id}" class="${addClass} bg-${bgColor} justify-center flex items-center text-${color} fill-${color} gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-${hoverBg} hover:text-${hoverText}">
                ${iconHtml ? `<span class="h-5 w-5">${iconHtml}</span>` : ''}
                <span>${text}</span>
            </a>
        `;
    }
}

// ลงทะเบียน Custom Element ชื่อว่า <custom-button>
customElements.define("custom-button", CustomButton);
