import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";

class MyBookings extends HTMLElement {
    constructor() {
        super();
        // ไม่ต้องใช้ shadow DOM จึงไม่ต้อง attachShadow
    }

    async connectedCallback() {
        const user = await getUserSession();
        console.log(user);
        if (!user) {
            window.location.href = "/mali-clear-clinic/pages/login.html";
            return;
        }

        this.userId = user.user_id;
        this.render();
        this.loadBookings();
    }

    async loadBookings() {
        try {
            const response = await fetch(`/mali-clear-clinic/api/Booking.php?user_id=${this.userId}`);
            const bookings = await response.json();
            console.log(bookings);
            console.log(this.userId);

            const bookingList = this.querySelector("#booking-list");
            bookingList.innerHTML = bookings.length > 0
                ? bookings.map(booking => `
                    <tr class="border-b border-gray-200 text-gray-700">
                        <td class="p-3">${booking.id}</td>
                        <td class="p-3">${booking.product_name}</td>
                        <td class="p-3">${booking.booking_date}</td>
                        <td class="p-3">${booking.status}</td>
                    </tr>
                `).join("")
                : "<tr><td colspan='4' class='p-4 text-center'>No bookings found.</td></tr>";
        } catch (error) {
            console.error("Error loading bookings:", error);
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <h2 class="text-2xl font-bold mb-4">My Bookings</h2>
                <div class="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead class="border-b border-gray-200">
                            <tr class="text-gray-800 font-semibold">
                                <th class="p-3 text-left">Booking ID</th>
                                <th class="p-3 text-left">Product</th>
                                <th class="p-3 text-left">Date</th>
                                <th class="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody id="booking-list">
                            <tr><td colspan="4" class="p-4 text-center">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define("my-bookings", MyBookings);
