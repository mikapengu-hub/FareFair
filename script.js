
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
    jeepney: "Traditional Jeepney",
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

const discounts = {
    regular: 0,
    student: 0.20,
    senior: 0.20,
    pwd: 0.20
};

// Traditional jeepney fare reference
const jeepneyMinimumFare = 14;
const minimumDistance = 4;
const succeedingRate = 2;

function barangayOptions() {
    return barangays.map(name =>
        `<option value="${name}">${name}</option>`
    ).join("");
}

calculator.innerHTML = `
    <h3>Check Your Transportation Fare</h3>

    <p class="demo-notice">
        Traditional jeepney fares use the minimum fare
        and succeeding-distance rate. Other transport fares
        are subject to verification.
    </p>

    <label for="origin">Origin</label>
    <select id="origin">
        <option value="">Select starting barangay</option>
        ${barangayOptions()}
    </select>

    <label for="destination">Destination</label>
    <select id="destination">
        <option value="">Select destination</option>
        ${barangayOptions()}
    </select>

    <label for="transport">Transportation Type</label>
    <select id="transport">
        <option value="">Select transportation</option>
        <option value="jeepney">Traditional Jeepney</option>
        <option value="e-jeepney">E-Jeepney</option>
        <option value="bus">Bus</option>
        <option value="tricycle">Tricycle</option>
    </select>

    <div id="distance-container" style="display:none;">
        <label for="distance">Estimated Distance (km)</label>
        <input
            type="number"
            id="distance"
            min="0.1"
            step="0.1"
            placeholder="Enter distance in kilometers"
        >
<small>Fare will be calculated based on the selected trip distance.</small>    </div>

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

const transportSelect = document.getElementById("transport");
const distanceContainer = document.getElementById("distance-container");

transportSelect.addEventListener("change", function () {
    distanceContainer.style.display =
        this.value === "jeepney" ? "block" : "none";
});

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

    if (transport !== "jeepney") {
        result.innerHTML = `
            <h3>Fare Information</h3>
            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Transportation:</strong> ${transportNames[transport]}</p>
            <p>Route-specific fare information is still being verified.</p>
            <small>FareFair will display an amount once reliable fare data is available.</small>
        `;
        return;
    }

    const distance = parseFloat(
        document.getElementById("distance").value
    );

    if (!distance || distance <= 0) {
        result.innerHTML = "<p>Please enter a valid trip distance.</p>";
        return;
    }

    let regularFare = jeepneyMinimumFare;

    if (distance > minimumDistance) {
        regularFare +=
            Math.ceil(distance - minimumDistance) * succeedingRate;
    }

    const discountRate = discounts[passenger];
    const discountAmount = regularFare * discountRate;
    const finalFare = regularFare - discountAmount;

    result.innerHTML = `
        <h3>Fare Estimate</h3>

        <p><strong>Origin:</strong> ${origin}</p>
        <p><strong>Destination:</strong> ${destination}</p>
        <p><strong>Transportation:</strong> ${transportNames[transport]}</p>
        <p><strong>Distance:</strong> ${distance.toFixed(1)} km</p>
        <p><strong>Passenger:</strong> ${passengerNames[passenger]}</p>

        <hr>

        <p>Regular Fare: ₱${regularFare.toFixed(2)}</p>
        <p>Discount: ${(discountRate * 100).toFixed(0)}%</p>
        <p>Discount Amount: ₱${discountAmount.toFixed(2)}</p>

        <h3>Estimated Fare: ₱${finalFare.toFixed(2)}</h3>

        <small>
            Based on the traditional jeepney fare reference.
            Actual route distance and fare should be confirmed.
            Discounts are subject to applicable eligibility rules.
        </small>
    `;
});


// FAREFAIR INTERACTIVE MAP

const mapElement = document.getElementById("farefair-map");

if (mapElement && typeof L !== "undefined") {

    const farefairMap = L.map("farefair-map").setView(
        [14.698, 121.12],
        13
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(farefairMap);

    const terminals = [
        {
            name: "AFPHODA Jeep Terminal",
            type: "Jeepney",
            area: "AFP Road, Silangan",
            coords: [14.6579375, 121.1513125]
        },
        {
            name: "SIL TODA Terminal",
            type: "Tricycle",
            area: "Langka Street, Silangan",
            coords: [14.6576875, 121.1520625]
        },
        {
            name: "GBS TODA Terminal",
            type: "Tricycle",
            area: "Kambal Road",
            coords: [14.6959375, 121.1214375]
        },
        {
            name: "BUTODA Terminal",
            type: "Tricycle",
            area: "Kambal Road",
            coords: [14.6959375, 121.1214375]
        },
        {
            name: "MATODA Terminal",
            type: "Tricycle",
            area: "Patiis Road",
            coords: [14.7025625, 121.1265625]
        },
        {
            name: "Patiis Tricycle Terminal",
            type: "Tricycle",
            area: "Malanday",
            coords: [14.7025625, 121.1263125]
        },
        {
            name: "SN TODA Terminal",
            type: "Tricycle",
            area: "San Mateo",
            coords: [14.6691875, 121.1343125]
        },
        {
            name: "DB TODA Terminal",
            type: "Tricycle",
            area: "General Luna Avenue",
            coords: [14.7008125, 121.1246875]
        }
    ];

    terminals.forEach(terminal => {
        const marker = L.marker(terminal.coords).addTo(farefairMap);

        marker.bindPopup(`
            <strong>${terminal.name}</strong><br>
            ${terminal.type} Terminal<br>
            ${terminal.area}<br>
            <small>Approximate area marker. Exact entrance is subject to verification.</small>
        `);
    });

    const terminalBounds = L.latLngBounds(
        terminals.map(terminal => terminal.coords)
    );

    farefairMap.fitBounds(terminalBounds, {
        padding: [30, 30]
    });
}
