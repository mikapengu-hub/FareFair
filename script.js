
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
        FareFair uses estimated road distances to calculate
        traditional jeepney fares. Actual jeepney routes and
        fares may vary.
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


// AUTOMATIC ROAD DISTANCE LOOKUP

const coordinateCache = {};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBarangayCoordinates(barangay) {

    if (coordinateCache[barangay]) {
        return coordinateCache[barangay];
    }

    const query = encodeURIComponent(
        `${barangay}, San Mateo, Rizal, Philippines`
    );

    const url =
        `https://photon.komoot.io/api/?q=${query}&limit=5&lat=14.698&lon=121.12`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Location lookup failed.");
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
        throw new Error(`Could not locate ${barangay}.`);
    }

    // Prefer a result located in San Mateo, Rizal.
    const match = data.features.find(feature => {
        const properties = feature.properties || {};
        const locationText = [
            properties.city,
            properties.county,
            properties.state,
            properties.name
        ].join(" ").toLowerCase();

        return locationText.includes("san mateo") ||
               locationText.includes("rizal");
    });

    const selected = match || data.features[0];

    const coordinates = selected.geometry.coordinates;

    const location = {
        longitude: coordinates[0],
        latitude: coordinates[1]
    };

    coordinateCache[barangay] = location;

    return location;
}


async function getRoadDistance(origin, destination) {

    const start = await getBarangayCoordinates(origin);

    // Avoid sending geocoding requests too quickly.
    await delay(1100);

    const end = await getBarangayCoordinates(destination);

    const routeURL =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start.longitude},${start.latitude};` +
        `${end.longitude},${end.latitude}` +
        `?overview=false`;

    const response = await fetch(routeURL);

    if (!response.ok) {
        throw new Error("Road distance service is unavailable.");
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes.length) {
        throw new Error("No road route was found.");
    }

    // OSRM returns distance in meters.
    return data.routes[0].distance / 1000;
}


// FARE CALCULATOR

document.getElementById("check-fare").addEventListener("click", async function () {

    const button = this;

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
            <p>Fare information for this transportation type is not yet available.</p>
        `;
        return;
    }

    button.disabled = true;
    button.textContent = "Calculating...";
    result.innerHTML = "<p>Finding the estimated road distance...</p>";

    try {

        const distance = await getRoadDistance(origin, destination);

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
            <p><strong>Passenger Category:</strong> ${passengerNames[passenger]}</p>

            <hr>

            <p>Estimated Road Distance: ${distance.toFixed(2)} km</p>
            <p>Regular Fare: ₱${regularFare.toFixed(2)}</p>
            <p>Discount: ${(discountRate * 100).toFixed(0)}%</p>
            <p>Discount Amount: ₱${discountAmount.toFixed(2)}</p>

            <h3>Estimated Fare: ₱${finalFare.toFixed(2)}</h3>

            <small>
                This is an estimate using barangay-level location
                results and a suggested road route. It may differ
                from the actual jeepney route and fare. Applicable
                passenger discounts are subject to eligibility rules.
            </small>
        `;

    } catch (error) {

        result.innerHTML = `
            <h3>Unable to Calculate Fare</h3>
            <p>We couldn't retrieve the road distance for this trip.</p>
            <small>Please try again later. The location or routing service may be temporarily unavailable.</small>
        `;

        console.error("FareFair calculation error:", error);

    } finally {

        button.disabled = false;
        button.textContent = "Check Fare";

    }
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
