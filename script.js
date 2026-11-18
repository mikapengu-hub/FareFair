
const calculator = document.getElementById("calculator-content");

const barangays = [
    "Ampid I",
    "Ampid II",
    "Banaba",
    "Dulong Bayan I",
    "Dulong Bayan II",
    "Guinayang",
    "Guitnang Bayan I",
    "Guitnang Bayan II",
    "Gulod Malaya",
    "Malanday",
    "Maly",
    "Pintong Bukawe",
    "Santa Ana",
    "Santo Niño",
    "Silangan"
];

const transportNames = {
    jeepney: "Jeepney",
    "e-jeepney": "E-Jeepney",
    bus: "Bus",
    tricycle: "Tricycle"
};

const passengerNames = {
    regular: "Regular Passenger",
    student: "Student",
    senior: "Senior Citizen",
    pwd: "Person with Disability (PWD)"
};

// DEMONSTRATION DISCOUNT RATES ONLY.
// Actual legal eligibility and applicability must be checked.

const discounts = {
    regular: 0,
    student: 0.20,
    senior: 0.20,
    pwd: 0.20
};

// FICTIONAL BASE FARES FOR WEBSITE TESTING ONLY.
// These are NOT official San Mateo transportation fares.

const baseFares = {
    jeepney: 13,
    "e-jeepney": 14,
    bus: 16,
    tricycle: 25
};

function barangayOptions() {
    return barangays.map(name =>
        `<option value="${name}">${name}</option>`
    ).join("");
}

calculator.innerHTML = `
    <h3>Check Your Transportation Fare</h3>

    <p class="demo-notice">
        DEMONSTRATION ONLY: All displayed fares are fictional
        sample estimates, not official transportation rates.
    </p>

    <label for="origin">Origin</label>
    <select id="origin">
        <option value="">Select starting barangay</option>
        ${barangayOptions()}
    </select>

    <label for="destination">Destination</label>
    <select id="destination">
        <option value="">Select destination barangay</option>
        ${barangayOptions()}
    </select>

    <label for="transport">Transportation Type</label>
    <select id="transport">
        <option value="">Select transportation</option>
        <option value="jeepney">Jeepney</option>
        <option value="e-jeepney">E-Jeepney</option>
        <option value="bus">Bus</option>
        <option value="tricycle">Tricycle</option>
    </select>

    <label for="passenger">Passenger Category</label>
    <select id="passenger">
        <option value="regular">Regular Passenger</option>
        <option value="student">Student</option>
        <option value="senior">Senior Citizen</option>
        <option value="pwd">PWD</option>
    </select>

    <button id="check-fare" type="button">Check Fare</button>

    <div id="fare-result" aria-live="polite">
        <p>Your fare information will appear here.</p>
    </div>
`;

document.getElementById("check-fare").addEventListener("click", function () {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const transport = document.getElementById("transport").value;
    const passenger = document.getElementById("passenger").value;
    const result = document.getElementById("fare-result");

    if (!origin || !destination || !transport) {
        result.innerHTML = "<p>Please complete your trip details.</p>";
        return;
    }

    if (origin === destination) {
        result.innerHTML = "<p>Please select two different barangays.</p>";
        return;
    }

    // Temporary route-distance simulation.
    // Barangay order is NOT actual geographic distance.

    const originIndex = barangays.indexOf(origin);
    const destinationIndex = barangays.indexOf(destination);
    const routeSteps = Math.abs(originIndex - destinationIndex);

    // Calculate sample regular fare.

    const regularFare = baseFares[transport] + (routeSteps * 2);

    // Calculate selected passenger discount.

    const discountRate = discounts[passenger];
    const discountAmount = regularFare * discountRate;
    const finalFare = regularFare - discountAmount;

    result.innerHTML = `
        <h3>Fare Estimate</h3>

        <p><strong>Origin:</strong> ${origin}</p>
        <p><strong>Destination:</strong> ${destination}</p>
        <p><strong>Transportation:</strong> ${transportNames[transport]}</p>
        <p><strong>Passenger Category:</strong> ${passengerNames[passenger]}</p>

        <hr>

        <p>Regular Fare: ₱${regularFare.toFixed(2)}</p>
        <p>Discount Rate: ${(discountRate * 100).toFixed(0)}%</p>
        <p>Discount Amount: ₱${discountAmount.toFixed(2)}</p>

        <h3>Estimated Fare: ₱${finalFare.toFixed(2)}</h3>

        <small>
            Fictional demonstration estimate only.
            Not an official fare quotation. Actual fares and
            discount eligibility may vary.
        </small>
    `;
});

// FAREFAIR INTERACTIVE MAP

const farefairMap = L.map("farefair-map").setView(
    [14.698, 121.12],
    13
);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(farefairMap);


// TERMINAL MARKERS
// Coordinates are approximate area markers, not verified entrances.

const terminals = [
    {
        name: "AFPHODA Jeep Terminal",
        type: "Jeepney",
        area: "AFP Road, Barangay Silangan",
        coords: [14.65933, 121.15027],
        status: "Approximate area marker"
    },
    {
        name: "EVMC Terminal",
        type: "Jeepney",
        area: "Tierra Monte, Barangay Silangan",
        coords: [14.65656, 121.14992],
        status: "Approximate area marker"
    },
    {
        name: "Jeepney Terminal & Office",
        type: "Jeepney",
        area: "Sampaguita Street, Modesta Village, Santo Niño",
        coords: [14.6990, 121.1200],
        status: "Approximate area marker"
    },
    {
        name: "SAMATODA Tricycle Terminal",
        type: "Tricycle",
        area: "M.H. Del Pilar Street corner Kambal Road",
        coords: [14.6989, 121.1210],
        status: "Approximate area marker"
    },
    {
        name: "SIL TODA Tricycle Terminal",
        type: "Tricycle",
        area: "Langka Street, Barangay Silangan",
        coords: [14.6600, 121.1510],
        status: "Approximate area marker"
    },
    {
        name: "BUTODA Tricycle Terminal",
        type: "Tricycle",
        area: "Kambal Road",
        coords: [14.6990, 121.1215],
        status: "Public listing; approximate pin"
    },
    {
        name: "GBS TODA Tricycle Terminal",
        type: "Tricycle",
        area: "Kambal Road",
        coords: [14.6992, 121.1218],
        status: "Public listing; approximate pin"
    },
    {
        name: "GBS TODA - M.H. Del Pilar",
        type: "Tricycle",
        area: "M.H. Del Pilar Street",
        coords: [14.6995, 121.1205],
        status: "Public listing; approximate pin"
    },
    {
        name: "MATODA Terminal",
        type: "Tricycle",
        area: "Sorrento Village Road",
        coords: [14.6950, 121.1250],
        status: "Unverified approximate pin"
    },
    {
        name: "MATODA Tricycle Terminal",
        type: "Tricycle",
        area: "Patiis Road",
        coords: [14.7240, 121.1260],
        status: "Approximate area marker"
    },
    {
        name: "Patiis Tricycle Terminal",
        type: "Tricycle",
        area: "Patiis Road, Malanday",
        coords: [14.7242, 121.1262],
        status: "Approximate area marker"
    },
    {
        name: "SN TODA Tricycle Terminal",
        type: "Tricycle",
        area: "San Mateo, exact street not confirmed",
        coords: [14.7000, 121.1190],
        status: "Unverified approximate pin"
    },
    {
        name: "DB TODA Terminal",
        type: "Tricycle",
        area: "General Luna Avenue",
        coords: [14.6990, 121.1150],
        status: "Approximate area marker"
    }
];

terminals.forEach(terminal => {
    const marker = L.marker(terminal.coords).addTo(farefairMap);

    marker.bindPopup(`
        <strong>${terminal.name}</strong><br>
        ${terminal.type} Terminal<br>
        ${terminal.area}<br>
        <small>${terminal.status}</small>
    `);
});


// SHOW ALL TERMINAL MARKERS
const terminalBounds = L.latLngBounds(
    terminals.map(terminal => terminal.coords)
);

farefairMap.fitBounds(terminalBounds, {
    padding: [30, 30]
});
// TEST MARKER - CHECK IF LEAFLET PINS WORK

L.marker([14.698, 121.12])
    .addTo(farefairMap)
    .bindPopup("<strong>FareFair Test Pin</strong>");
