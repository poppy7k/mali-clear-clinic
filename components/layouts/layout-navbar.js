import { getUserSession, logout } from '/mali-clear-clinic/scripts/auth/userSession.js';

class CustomNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.renderNavbar();
        this.checkUserLogin();
    }

    renderNavbar() {
        this.innerHTML = `
        <div class="sticky z-50 relative top-0">
            <nav class="items-center w-full bg-white py-4">
                <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
                    <a href="/mali-clear-clinic/index.html" class="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="/mali-clear-clinic/assets/images/maliclear-logo.png" class="h-16" alt="Logo">
                    </a>
                    <div class="hidden w-full md:block md:w-auto" id="navbar-default">
                        <ul class="font-medium flex flex-row rounded-lg text-gray-600 gap-4 text-lg font-semibold items-center" id="navbar-links">
                            ${this.renderNavLinks()}
                            <li id="login-link"></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
        `;
    }

    renderNavLinks() {
        const links = [
            { href: "/mali-clear-clinic/index.html", text: "Home", icon: "home.html" },
            { href: "/mali-clear-clinic/pages/service.html", text: "Services", icon: "service.html" },
            { href: "#", text: "Promotions", icon: "promo.html" },
            { href: "#", text: "Blog & Tips", icon: "blog.html" },
            { href: "#", text: "Contact Us", icon: "contact.html" }
        ];

        return links.map(link => `
            <custom-button href="${link.href}" text="${link.text}" hoverBg="white" hoverText="yellow-400" color="gray-600" class="w-max"></custom-button>
        `).join('');
    }

    async checkUserLogin() {
        const user = await getUserSession();
        document.getElementById("login-link").innerHTML = user ? await this.renderUserDropdown(user) : this.renderBookNowButton();
        if (user) this.setupDropdownListeners();
    }

    renderBookNowButton() {
        return `
            <a href="/mali-clear-clinic/pages/login.html" class="py-2 px-4 border-2 rounded-[22px] transition-all duration-300 hover:bg-yellow-400 hover:text-black hover:fill-black">
                BOOK NOW
            </a>
        `;
    }

    async renderUserDropdown(user) {
        return `
            <div class="relative">
                <button id="profile-btn" class="py-2 px-2 rounded-[22px] transition-all duration-300 fill-gray-700 cursor-pointer hover:fill-yellow-400 hover:scale-125">
                    ${await this.loadIcon("user.html", "h-6 w-6 text-gray-700", "bg-gray-200 p-2 rounded-full")}
                </button>
                <div id="dropdown" class="absolute right-0 mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg hidden px-4 py-2 z-50">
                    <div class="px-1 pt-1 pb-2">@${user.username}</div>
                    <ul class="py-2 gap-2">
                        ${user.role === 'ADMIN' ? await this.renderAdminSection() : ""}
                    </ul>
                    <div class="relative flex py-0 items-center">
                        <div class="flex-grow border-t border-gray-300"></div>
                        <div class="flex-grow border-t border-gray-300"></div>
                    </div>
                    <ul class="py-2">
                        ${await this.renderNavItem("/mali-clear-clinic/pages/my-booking.html", "My Bookings", "bookings.html", "h-5 w-5", "p-1")}
                        <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black cursor-pointer">
                            <button id="logout-btn" class="px-1 flex text-sm text-gray-600 flex items-center gap-2 cursor-pointer">
                                ${await this.loadIcon("logout.html", "h-6 w-6 text-red-500", "px-1")}
                                <span class="text-red-500">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    async renderAdminSection() {
        return `
            <div class="relative flex py-0 items-center">
                <div class="flex-grow border-t border-gray-300"></div>
                <span class="flex-shrink mx-2 text-gray-400 font-semibold text-sm">Admin</span>
                <div class="flex-grow border-t border-gray-300"></div>
            </div>
            ${await this.renderAdminLinks()}
        `;
    }

    async renderAdminLinks() {
        return `
            ${await this.renderNavItem("/mali-clear-clinic/pages/admin-booking.html", "Bookings", "bookings.html", "h-5 w-5", "p-1")}
            ${await this.renderNavItem("/mali-clear-clinic/pages/admin-promotions.html", "Promotions", "promo.html", "h-5 w-5", "p-1")}
        `;
    }

    async renderNavItem(href, text, iconFile, iconClass = "h-5 w-5", wrapperClass = "") {
        return `
            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                <a href="${href}" class="px-1 flex text-sm text-gray-600 flex items-center gap-2">
                    ${await this.loadIcon(iconFile, iconClass, wrapperClass)} ${text}
                </a>
            </li>
        `;
    }

    async loadIcon(iconFile, iconClass = "h-5 w-5", wrapperClass = "") {
        try {
            const response = await fetch(`/mali-clear-clinic/assets/icons/${iconFile}`);
            if (!response.ok) throw new Error(`Failed to load icon: ${iconFile}`);
            let iconHTML = await response.text();

            // เพิ่ม class ให้กับ <svg>
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = iconHTML;
            let svgElement = tempDiv.querySelector("svg");
            if (svgElement) {
                svgElement.classList.add(...iconClass.split(" "));
            }

            return `<div class="${wrapperClass}">${tempDiv.innerHTML}</div>`;
        } catch (error) {
            console.error("Error loading icon:", error);
            return "";
        }
    }

    setupDropdownListeners() {
        document.getElementById("profile-btn").addEventListener("click", (event) => {
            event.stopPropagation();
            document.getElementById("dropdown").classList.toggle("hidden");
        });

        document.addEventListener("click", (event) => {
            if (!document.getElementById("profile-btn").contains(event.target)) {
                document.getElementById("dropdown").classList.add("hidden");
            }
        });

        document.getElementById("logout-btn").addEventListener("click", async () => {
            await logout();
            window.location.href = "/mali-clear-clinic/index.html";
        });
    }
}

customElements.define("layout-navbar", CustomNavbar);
