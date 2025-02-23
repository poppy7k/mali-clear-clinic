import { getUserSession, logout } from '/mali-clear-clinic/scripts/auth/userSession.js';

class CustomNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <div class="sticky relative top-0">
            <nav class="items-center w-full z-50 bg-white py-4">
                <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
                    <a href="/mali-clear-clinic/index.html" class="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="/mali-clear-clinic/assets/images/maliclear-logo.png" class="h-16" alt="Logo">
                    </a>
                    <div class="hidden w-full md:block md:w-auto" id="navbar-default">
                        <ul class="font-medium flex flex-row rounded-lg text-gray-600 gap-4 text-lg font-semibold items-center" id="navbar-links">
                            <custom-button href="/mali-clear-clinic/index.html" text="Home" hoverBg="white" hoverText="yellow-400" color="gray-600" class="w-max"></custom-button>
                            <custom-button href="/mali-clear-clinic/pages/service.html" text="Services" hoverBg="white" hoverText="yellow-400" color="gray-600" class="w-max"></custom-button>
                            <custom-button href="#" text="Promotions" hoverBg="white" hoverText="yellow-400" color="gray-600" class="w-max"></custom-button>
                            <custom-button href="#" text="Blog & Tips" hoverBg="white" hoverText="yellow-400" color="gray-600" class="w-max"></custom-button>
                            <custom-button href="#" text="Contact Us" hoverBg="white" hoverText="yellow-400" color="gray-600" class="w-max"></custom-button>
                            <li id="login-link">
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
        `;
        
        this.checkUserLogin();
    }

    async checkUserLogin() {
        const user = await getUserSession();
        
        if (user) {
            this.updateNavbarWithUser(user);
        } else {
            this.showBookNowButton();
        }
    }

    showBookNowButton() {
        document.getElementById("login-link").innerHTML = `
            <a href="/mali-clear-clinic/pages/login.html" class="py-2 px-4 border-2 rounded-[22px] transition-all duration-300 hover:bg-yellow-400 hover:text-black hover:fill-black">
                <svg class="inline-block h-5 -mt-1 align-middle" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                    <path d="m3.866,18.965c-.186.32-.521.5-.867.5-.17,0-.342-.043-.5-.134-1.542-.892-2.5-2.551-2.5-4.331V7C0,4.243,2.243,2,5,2v-1c0-.552.448-1,1-1s1,.448,1,1v1h7v-1c0-.552.447-1,1-1s1,.448,1,1v1c2.757,0,5,2.243,5,5v8c0,.552-.447,1-1,1s-1-.448-1-1v-6h-1c-.553,0-1-.448-1-1s.447-1,1-1h1c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3h8c.552,0,1,.448,1,1s-.448,1-1,1H2v6c0,1.068.575,2.064,1.5,2.599.478.276.642.888.365,1.366Zm16.892-.385l-3.749-1.401v-5.045c0-1.516-1.076-2.834-2.503-3.066-.881-.143-1.768.102-2.439.673-.672.571-1.058,1.405-1.058,2.286v7.563l-1.015-.808c-.007-.006-.016-.006-.023-.012-1.211-1.053-3.049-.975-4.153.207-1.13,1.208-1.066,3.11.13,4.23l.558.538c.186.18.435.28.694.28.9,0,1.342-1.095.694-1.72l-.568-.548c-.403-.378-.424-1.013-.046-1.416.375-.402,1.008-.421,1.41-.048.01.009,2.697,2.151,2.697,2.151.301.24.713.285,1.057.119.346-.167.566-.517.566-.901v-9.638c0-.294.129-.572.353-.763.228-.193.518-.273.822-.223.463.076.825.556.825,1.093v5.739c0,.417.259.791.65.937l4.399,1.644c1.104.412,1.866,1.438,1.943,2.612.035.529.475.935.997.935.022,0,.044,0,.066-.002.551-.037.969-.513.933-1.063-.129-1.958-1.4-3.668-3.24-4.354Z"/>
                </svg>
                BOOK NOW
            </a>
        `;
    }

    updateNavbarWithUser(user) {
        // อัปเดต navbar ด้วยข้อมูลของผู้ใช้
        if (user.role === 'ADMIN') {
            document.getElementById("login-link").innerHTML = `
                <div class="relative">
                    <button id="profile-btn" class="py-2 px-2 rounded-[22px] transition-all duration-300 fill-gray-700 cursor-pointer hover:fill-yellow-400 hover:scale-125">
                        <svg class="h-5" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                    </button>
                    <div id="dropdown" class="absolute right-0 mt-2 w-52 bg-white border-1 border-gray-300 rounded-lg shadow-lg hidden px-4 py-2 z-50">
                        <div class="px-1 pt-1 pb-2">
                            @${user.username}
                        </div>
                        <div class="relative flex py-0 items-center">
                            <div class="flex-grow border-t border-gray-300"></div>
                            <span class="flex-shrink mx-2 text-gray-400 font-semibold text-sm">Admin</span>
                            <div class="flex-grow border-t border-gray-300"></div>
                        </div>
                        <ul class="py-2">
                            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                                <a href="/mali-clear-clinic/pages/admin-booking.html" class="px-1 flex text-sm text-gray-600 flex items-center gap-2 fill-gray-600">
                                    <svg class="h-5" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="M22.2,2.163a4.992,4.992,0,0,0-4.1-1.081l-3.822.694A4,4,0,0,0,12,3.065,4,4,0,0,0,9.716,1.776L5.9,1.082A5,5,0,0,0,0,6V16.793a5,5,0,0,0,4.105,4.919l6.286,1.143a9,9,0,0,0,3.218,0L19.9,21.712A5,5,0,0,0,24,16.793V6A4.983,4.983,0,0,0,22.2,2.163ZM11,20.928c-.084-.012-.168-.026-.252-.041L4.463,19.745A3,3,0,0,1,2,16.793V6A3,3,0,0,1,5,3a3.081,3.081,0,0,1,.54.049l3.82.7A2,2,0,0,1,11,5.712Zm11-4.135a3,3,0,0,1-2.463,2.952l-6.285,1.142c-.084.015-.168.029-.252.041V5.712a2,2,0,0,1,1.642-1.968l3.821-.7A3,3,0,0,1,22,6Z"/></svg>
                                    Bookings
                                </a>
                            </li>
                            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                                <a href="/mali-clear-clinic/pages/admin-promotions.html" class="px-1 flex text-sm text-gray-600 flex items-center gap-2 fill-gray-600">
                                    <svg class="h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M21.5,2H2.5A2.5,2.5,0,0,0,0,4.5v15A2.5,2.5,0,0,0,2.5,22h19A2.5,2.5,0,0,0,24,19.5V4.5A2.5,2.5,0,0,0,21.5,2ZM22,19.5A.5.5,0,0,1,21.5,20H2.5a.5.5,0,0,1-.5-.5V4.5A.5.5,0,0,1,2.5,4h19a.5.5,0,0,1,.5.5Z"/>
                                        <path d="M12,7a3,3,0,1,0,3,3A3,3,0,0,0,12,7Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,12,11Z"/>
                                        <path d="M5,15a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V16A1,1,0,0,0,5,15Z"/>
                                        <path d="M19,15a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V16A1,1,0,0,0,19,15Z"/>
                                    </svg>
                                    Promotions
                                </a>
                            </li>
                        </ul>
                        <div class="relative flex py-0 items-center">
                            <div class="flex-grow border-t border-gray-300"></div>
                            <div class="flex-grow border-t border-gray-300"></div>
                        </div>
                        <ul class="py-2">
                            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                                <a href="/mali-clear-clinic/pages/my-booking.html" class="px-1 flex text-sm text-gray-600 flex items-center gap-2 fill-gray-600">
                                    <svg class="h-5" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="M22.2,2.163a4.992,4.992,0,0,0-4.1-1.081l-3.822.694A4,4,0,0,0,12,3.065,4,4,0,0,0,9.716,1.776L5.9,1.082A5,5,0,0,0,0,6V16.793a5,5,0,0,0,4.105,4.919l6.286,1.143a9,9,0,0,0,3.218,0L19.9,21.712A5,5,0,0,0,24,16.793V6A4.983,4.983,0,0,0,22.2,2.163ZM11,20.928c-.084-.012-.168-.026-.252-.041L4.463,19.745A3,3,0,0,1,2,16.793V6A3,3,0,0,1,5,3a3.081,3.081,0,0,1,.54.049l3.82.7A2,2,0,0,1,11,5.712Zm11-4.135a3,3,0,0,1-2.463,2.952l-6.285,1.142c-.084.015-.168.029-.252.041V5.712a2,2,0,0,1,1.642-1.968l3.821-.7A3,3,0,0,1,22,6Z"/></svg>
                                    <span>My Bookings</span>
                                </a>
                            </li>
                            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                                <button href="#" id="logout-btn" class="px-1 flex text-sm text-gray-600 flex items-center gap-2 cursor-pointer w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-500">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    <span class="text-red-500">Logout</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            document.getElementById("login-link").innerHTML = `
                <div class="relative">
                    <button id="profile-btn" class="py-2 px-2 rounded-[22px] transition-all duration-300 fill-gray-700 cursor-pointer hover:fill-yellow-400 hover:scale-125">
                        <svg class="h-5" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                    </button>
                    <div id="dropdown" class="absolute right-0 mt-2 w-52 bg-white border-1 border-gray-300 rounded-lg shadow-lg hidden px-4 py-2 z-50">
                        <div class="px-1 pt-1 pb-2">
                            @${user.username}
                        </div>
                        <ul class="py-2">
                            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                                <a href="/mali-clear-clinic/pages/my-booking.html" class="px-1 flex text-sm text-gray-600 flex items-center gap-2 fill-gray-600">
                                    <svg class="h-5" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="M22.2,2.163a4.992,4.992,0,0,0-4.1-1.081l-3.822.694A4,4,0,0,0,12,3.065,4,4,0,0,0,9.716,1.776L5.9,1.082A5,5,0,0,0,0,6V16.793a5,5,0,0,0,4.105,4.919l6.286,1.143a9,9,0,0,0,3.218,0L19.9,21.712A5,5,0,0,0,24,16.793V6A4.983,4.983,0,0,0,22.2,2.163ZM11,20.928c-.084-.012-.168-.026-.252-.041L4.463,19.745A3,3,0,0,1,2,16.793V6A3,3,0,0,1,5,3a3.081,3.081,0,0,1,.54.049l3.82.7A2,2,0,0,1,11,5.712Zm11-4.135a3,3,0,0,1-2.463,2.952l-6.285,1.142c-.084.015-.168.029-.252.041V5.712a2,2,0,0,1,1.642-1.968l3.821-.7A3,3,0,0,1,22,6Z"/></svg>
                                    <span>
                                        My Bookings
                                    </span>
                                </a>
                            </li>
                            <li class="px-1 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                                <button href="#" id="logout-btn" class="px-1 flex text-sm text-gray-600 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-500">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    <span class="text-red-500">
                                        Logout
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        }
    
        const profileButton = document.getElementById("profile-btn");
        const dropdown = document.getElementById("dropdown");

        profileButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent click from bubbling up to the document
            dropdown.classList.toggle("hidden");  // Toggle hidden class to show/hide dropdown
        });

        // Close dropdown if click is outside of profile button and dropdown
        document.addEventListener("click", (event) => {
            if (!profileButton.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.add("hidden");
            }
        });

        // Logout functionality
        document.getElementById("logout-btn").addEventListener("click", async () => {
            await logout();
            // Optionally, redirect or refresh after logout
            window.location.href = "/mali-clear-clinic/index.html";  // Redirect to homepage or login page
        });
    }
    
}

customElements.define("layout-navbar", CustomNavbar);
