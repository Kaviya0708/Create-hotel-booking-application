// ========================================================
// THE HOTEL APP MANAGEMENT PLATFORM DATA CONTROLLER
// ========================================================
const HotelSystem = {
    STORAGE_KEYS: {
        ROOMS: "hotel_room_inventory",
        BOOKINGS: "hotel_active_reservations"
    },
    rooms: [],
    bookings: [],

    // 1. Core Startup Initialization Loop
    init() {
        // Hydrate baseline room classifications state model parameters
        this.rooms = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ROOMS)) || [
            { id: "rm_std", name: "Deluxe Standard Room", rate: 120, inventory: 15, desc: "Features a queen size bed, high-speed fiber internet array, and workstation layout parameters." },
            { id: "rm_ste", name: "Executive Suite Panoramic", rate: 250, inventory: 6, desc: "Includes a separate living lounge, king size bed, complimentary mini-bar, and ocean view line balances." },
            { id: "rm_pnh", name: "Presidential Penthouse", rate: 580, inventory: 2, desc: "Ultimate luxury setup with private terrace access, personal hot tub, and dedicated butler service options." }
        ];

        // Hydrate active reservations stack profile arrays
        this.bookings = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.BOOKINGS)) || [];

        this.syncSystemState();
        this.populateDropdown();
    },

    // 2. Add New Booking Profile and Adjust Inventory
    createBooking(guestName, roomId, checkIn, checkOut) {
        const room = this.rooms.find(rm => rm.id === roomId);
        if (!room) return;

        // Inventory safety validator guard line
        if (room.inventory <= 0) {
            alert("Operational Fault: Selected room classification variant contains no physical vacancy remaining!");
            return;
        }

        // Compute calendar date differences to evaluate total cost
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) {
            alert("Input Error: Check-Out Date must be scheduled at least 24 hours after selected Check-In assignment.");
            return;
        }

        const calculatedCost = room.rate * totalDays;

        const newReservation = {
            id: "res_" + Math.random().toString(36).substr(2, 9),
            guestName: guestName.trim(),
            roomName: room.name,
            roomId: roomId,
            checkIn: checkIn,
            checkOut: checkOut,
            nights: totalDays,
            totalCost: calculatedCost
        };

        // Mutate array indices states balances
        room.inventory -= 1;
        this.bookings.push(newReservation);
        
        this.syncSystemState();
    },

    // 3. Reverse Booking Modifications and Return Inventory Balance
    cancelReservation(reservationId) {
        const bookingIndex = this.bookings.findIndex(res => res.id === reservationId);
        if (bookingIndex === -1) return;

        const booking = this.bookings[bookingIndex];
        const room = this.rooms.find(rm => rm.id === booking.roomId);

        if (room) {
            room.inventory += 1; // Return space back to matching operational pool
        }

        this.bookings.splice(bookingIndex, 1);
        this.syncSystemState();
    },

    syncSystemState() {
        localStorage.setItem(this.STORAGE_KEYS.ROOMS, JSON.stringify(this.rooms));
        localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
        this.calculateMetrics();
        this.renderCatalogUI();
        this.renderLedgerUI();
    },

    // 4. Populate Dynamic Selection Options Dropdown Widget
    populateDropdown() {
        const select = document.getElementById('roomTypeSelect');
        select.innerHTML = this.rooms.map(rm => `<option value="${rm.id}">${rm.name} ($${rm.rate}/night)</option>`).join('');
    },

    // 5. System Analytics Engine Calculations
    calculateMetrics() {
        const activeBookingsCount = this.bookings.length;
        const grossRevenue = this.bookings.reduce((sum, res) => sum + res.totalCost, 0);
        const availableRooms = this.rooms.reduce((sum, rm) => sum + rm.inventory, 0);

        // Update system dashboard presentation nodes
        document.getElementById('activeBookingsCount').textContent = activeBookingsCount;
        document.getElementById('grossRevenueCount').textContent = `$${grossRevenue.toLocaleString()}`;
        document.getElementById('totalInventoryCount').textContent = availableRooms;
    },

    // 6. Dynamic HTML DOM Parsing: Room Catalog Grid
    renderCatalogUI() {
        const grid = document.getElementById('roomCatalogGrid');
        grid.innerHTML = "";

        this.rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = "room-card";

            const isLow = room.inventory <= 2;

            card.innerHTML = `
                <div>
                    <h4>${room.name}</h4>
                    <p>${room.desc}</p>
                </div>
                <div class="room-meta">
                    <span class="price-tag">$${room.rate}/night</span>
                    <span class="inventory-tag ${isLow ? 'low' : ''}">
                        ${room.inventory > 0 ? `${room.inventory} Rooms Left` : 'FULLY BOOKED'}
                    </span>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // 7. Dynamic HTML DOM Parsing: Reservation Records Ledger Sidebar
    renderLedgerUI() {
        const container = document.getElementById('bookingsLedgerContainer');
        container.innerHTML = "";

        if (this.bookings.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#64748b; padding: 20px 0;">No active accommodations assigned within current registration timeline.</p>`;
            return;
        }

        this.bookings.forEach(res => {
            const item = document.createElement('div');
            item.className = "booking-item";

            item.innerHTML = `
                <div class="booking-item-header">
                    <span>${res.guestName}</span>
                    <span style="color:#34d399;">$${res.totalCost.toLocaleString()}</span>
                </div>
                <div class="booking-details">
                    <strong>${res.roomName}</strong><br>
                    Timeline: ${res.checkIn} to ${res.checkOut} (${res.nights} Nights)
                </div>
                <button class="btn-cancel cancel-btn" data-id="${res.id}">Cancel Booking</button>
            `;
            container.appendChild(item);
        });
    }
};

// ========================================================
// CONTROLLER EVENT HANDLING INTERFACE LOGIC
// ========================================================

// Handle Booking Form Entry Processing Submissions
document.getElementById('bookingForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const guest = document.getElementById('guestName');
    const type = document.getElementById('roomTypeSelect');
    const checkIn = document.getElementById('checkInDate');
    const checkOut = document.getElementById('checkOutDate');

    // Route inputs down to system state handlers
    HotelSystem.createBooking(guest.value, type.value, checkIn.value, checkOut.value);

    // Flush form inputs clear back to default baseline configurations
    guest.value = "";
    type.selectedIndex = 0;
    checkIn.value = "";
    checkOut.value = "";
});

// Event Delegation capture block handles cancel actions within dynamic elements
document.getElementById('bookingsLedgerContainer').addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('cancel-btn')) {
        const selectedId = target.getAttribute('data-id');
        if (confirm("Are you sure you want to permanently cancel this accommodation reservation booking profile?")) {
            HotelSystem.cancelReservation(selectedId);
        }
    }
});

// Hook engine boot loops once HTML structural components compile securely
document.addEventListener('DOMContentLoaded', () => {
    HotelSystem.init();
    
    // Safety baseline: Ensure selection date fields cannot enter historical time parameters
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').min = todayStr;
    document.getElementById('checkOutDate').min = todayStr;
});

