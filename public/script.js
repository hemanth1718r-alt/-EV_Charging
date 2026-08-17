document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let globalStations = [];
    let currentSelectedStationId = null;

    // --- DOM Elements ---
    const navStations = document.getElementById('nav-stations');
    const navBookings = document.getElementById('nav-bookings');
    const viewStations = document.getElementById('view-stations');
    const viewBookings = document.getElementById('view-bookings');
    
    const stationListEl = document.getElementById('station-list');
    const bookingListEl = document.getElementById('booking-list');
    
    const emptyState = document.getElementById('empty-state');
    const stationDetails = document.getElementById('station-details');
    const bookingForm = document.getElementById('booking-form');
    
    // --- Navigation Logic ---
    navStations.addEventListener('click', () => { window.location.hash = 'stations'; });
    navBookings.addEventListener('click', () => { window.location.hash = 'bookings'; });

    window.addEventListener('hashchange', handleRouteChange);

    function handleRouteChange() {
        const currentView = window.location.hash.replace('#', '') || 'stations';

        navStations.classList.toggle('active', currentView === 'stations');
        navBookings.classList.toggle('active', currentView === 'bookings');
        
        viewStations.classList.toggle('active-view', currentView === 'stations');
        viewStations.classList.toggle('hidden', currentView !== 'stations');
        
        viewBookings.classList.toggle('active-view', currentView === 'bookings');
        viewBookings.classList.toggle('hidden', currentView !== 'bookings');

        if (currentView === 'bookings') {
            fetchBookings();
        }
    }

    const dateInput = document.getElementById('form-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    // --- API Interactions ---

    async function fetchStations() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const res = await fetch(`/api/stations?userLat=${lat}&userLng=${lng}`);
                        globalStations = await res.json();
                        renderStations();
                    },
                    async () => {
                        const res = await fetch('/api/stations');
                        globalStations = await res.json();
                        renderStations();
                    }
                );
            } else {
                const res = await fetch('/api/stations');
                globalStations = await res.json();
                renderStations();
            }
        } catch (error) {
            showToast('Failed to load stations', 'error');
        }
    }

    function renderStations() {
        stationListEl.innerHTML = '';
        if(globalStations.length === 0) {
            stationListEl.innerHTML = '<p>No stations currently available.</p>';
            return;
        }

        globalStations.forEach(station => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = station.id;
            
            const badgeClass = station.chargeType.toLowerCase().includes('dc') ? 'fast' : 'level2';
            const distanceHtml = station.distanceAway 
                ? `<p style="color: var(--primary); font-weight: 500;">${station.distanceAway} km away</p>` 
                : '';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3>${station.name}</h3>
                    <span class="badge ${badgeClass}">${station.chargeType}</span>
                </div>
                <p>${station.address}</p>
                ${distanceHtml}
                <p><strong>${station.availablePorts}</strong> ports available</p>
            `;

            card.addEventListener('click', () => selectStation(station.id));
            stationListEl.appendChild(card);
        });
    }

    function selectStation(id) {
        currentSelectedStationId = id;
        const station = globalStations.find(s => s.id === id);
        if(!station) return;

        document.querySelectorAll('#station-list .card').forEach(c => {
            c.classList.toggle('selected', c.dataset.id === id);
        });

        emptyState.classList.add('hidden');
        stationDetails.classList.remove('hidden');

        document.getElementById('detail-name').textContent = station.name;
        document.getElementById('detail-address').textContent = station.address;
        document.getElementById('detail-type').textContent = station.chargeType;
        document.getElementById('detail-ports').textContent = station.availablePorts;
        document.getElementById('form-station-id').value = station.id;
    }

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const start = document.getElementById('form-start').value;
        const end = document.getElementById('form-end').value;
        if (start >= end) {
            showToast('End time must be after start time', 'error');
            return;
        }

        const payload = {
            stationId: document.getElementById('form-station-id').value,
            userName: document.getElementById('form-name').value,
            vehicleModel: document.getElementById('form-vehicle').value,
            date: document.getElementById('form-date').value,
            startTime: start,
            endTime: end
        };

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                
                // Show the new bk_EVB001 ID here
                showToast(`Reservation confirmed! ID: ${data.booking.id}`);
                
                bookingForm.reset();
                dateInput.value = today; 
                
                setTimeout(() => {
                    window.location.hash = 'bookings';
                }, 1500);
            } else {
                const data = await res.json();
                showToast(data.error || 'Booking failed', 'error');
            }
        } catch (error) {
            showToast('Server connection error', 'error');
        }
    });

    async function fetchBookings() {
        try {
            const res = await fetch('/api/bookings');
            const bookings = await res.json();
            renderBookings(bookings);
        } catch (error) {
            showToast('Failed to load bookings', 'error');
        }
    }

    function renderBookings(bookings) {
        bookingListEl.innerHTML = '';
        
        if (bookings.length === 0) {
            bookingListEl.innerHTML = '<p class="empty-state">You have no bookings yet.</p>';
            return;
        }

        bookings.reverse().forEach(booking => {
            const station = globalStations.find(s => s.id === booking.stationId);
            const stationName = station ? station.name : 'Unknown Station';
            
            const card = document.createElement('div');
            card.className = 'card booking-card';
            
            card.innerHTML = `
                <div class="header">
                    <h3>${stationName}</h3>
                    <span class="badge active">${booking.status}</span>
                </div>
                <div class="info">
                    <p><span>Booking ID:</span> <strong style="color: var(--primary);">${booking.id}</strong></p>
                    <p><span>Driver:</span> ${booking.userName}</p>
                    <p><span>Vehicle:</span> ${booking.vehicleModel}</p>
                    <p><span>Date:</span> ${formatDate(booking.date)}</p>
                    <p><span>Time:</span> ${booking.startTime} - ${booking.endTime}</p>
                </div>
                <button class="btn-danger" onclick="deleteBooking('${booking.id}')">Cancel Reservation</button>
            `;
            
            bookingListEl.appendChild(card);
        });
    }

    // New Delete Function (completely removes the booking)
    window.deleteBooking = async function(bookingId) {
        if(!confirm('Are you sure you want to cancel this reservation?')) return;

        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('Reservation canceled successfully');
                fetchBookings(); // Refresh the list
            } else {
                showToast('Failed to delete', 'error');
            }
        } catch (error) {
            showToast('Server connection error', 'error');
        }
    };

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if(container.contains(toast)) container.removeChild(toast);
        }, 3000);
    }

    function formatDate(dateString) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    handleRouteChange();
    fetchStations();
});