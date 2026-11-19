
// ==========================================
// FAREFAIR - SAN MATEO, RIZAL
// Fare Calculator and Interactive Map
// ==========================================


// ------------------------------------------
// 1. BARANGAY DATABASE
// ------------------------------------------

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


// ------------------------------------------
// 2. TRANSPORTATION AND PASSENGER LABELS
// ------------------------------------------

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


// ------------------------------------------
// 3. FARE REFERENCES
// ------------------------------------------

// These are project estimates.
// Confirm applicable official fare matrices before
// presenting them as official fares.

const fareRates = {
    jeepney: {
        minimumFare: 14,
        minimumDistance: 4,
        succeedingRate: 2
    },

    "e-jeepney": {
        minimumFare: 17,
        minimumDistance: 4,
        succeedingRate: 2.40
    },

    bus: {
        ordinaryCity: {
            name: "Ordinary City Bus",
            minimumFare: 15,
            minimumDistance: 5,
            succeedingRate: 2.49
        },

        airconCity: {
            name: "Air-conditioned City Bus",
            minimumFare: 18,
            minimumDistance: 5,
            succeedingRate: 2.98
        },

        ordinaryProvincial: {
            name: "Ordinary Provincial Bus",
            minimumFare: 12,
            minimumDistance: 5,
            succeedingRate: 2.20
        }
    },

    tricycle: {
        specialMin: 50,
        specialMax: 60,
        hatiPerPassenger: 15,
        hatiPassengers: 4
    }
};


// ------------------------------------------
// 4. INITIALIZE WEBSITE
// ------------------------------------------

function initializeFareFair() {

    const calculator = document.getElementById("calculator-content");

    if (calculator) {
        buildCalculator(calculator);
    }

    initializeMap();
}


// ------------------------------------------
// 5. BUILD FARE CALCULATOR
// ------------------------------------------

function buildCalculator(calculator) {

    function barangayOptions() {
        return barangays.map(name =>
            `<option value="${name}">${name}</option>`
        ).join("");
    }

    calculator.innerHTML = `
        <h3>Check Your Transportation Fare</h3>

        <p class="demo-notice">
            FareFair provides estimated fares using available
            fare references and estimated road distances.
            Actual fares may vary.
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

        <div id="bus-options" style="display:none;">
            <label for="bus-type">Bus Classification</label>
            <select id="bus-type">
                <option value="ordinaryCity">Ordinary City Bus</option>
                <option value="airconCity">Air-conditioned City Bus</option>
                <option value="ordinaryProvincial">Ordinary Provincial Bus</option>
            </select>
        </div>

        <div id="tricycle-options" style="display:none;">
            <label for="tricycle-type">Tricycle Fare Type</label>
            <select id="tricycle-type">
                <option value="special">Special (Exclusive Ride)</option>
                <option value="hati">Hati (4 Passengers)</option>
            </select>
        </div>

        <label for="passenger">Passenger Category</label>
        <select id="passenger">
            <option value="regular">Regular Passenger</option>
            <option value="student">Student</option>
            <option value="senior">Senior Citizen</option>
            <option value="pwd">PWD</option>
        </select>

        <button id="check-fare" type="button">
            Check Fare
        </button>

        <div id="fare-result" aria-live="polite">
            <p>Your fare estimate will appear here.</p>
        </div>
    `;

    const transport = document.getElementById("transport");

    transport.addEventListener("change", function () {

        document.getElementById("bus-options").style.display =
            this.value === "bus" ? "block" : "none";

        document.getElementById("tricycle-options").style.display =
            this.value === "tricycle" ? "block" : "none";
    });

    document.getElementById("check-fare")
        .addEventListener("click", calculateFare);
}


// ------------------------------------------
// 6. AUTOMATIC DISTANCE CALCULATION
// ------------------------------------------

const coordinateCache = {};

function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
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
        throw new Error("Location service unavailable.");
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
        throw new Error(`Could not locate ${barangay}.`);
    }

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

    await delay(1100);

    const end = await getBarangayCoordinates(destination);

    const routeURL =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start.longitude},${start.latitude};` +
        `${end.longitude},${end.latitude}?overview=false`;

    const response = await fetch(routeURL);

    if (!response.ok) {
        throw new Error("Road distance service unavailable.");
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || !data.routes.length) {
        throw new Error("No road route found.");
    }

    return data.routes[0].distance / 1000;
}


// ------------------------------------------
// 7. FARE COMPUTATION
// ------------------------------------------

function calculateDistanceFare(distance, rate) {

    let fare = rate.minimumFare;

    if (distance > rate.minimumDistance) {

        const succeedingKilometers =
            Math.ceil(distance - rate.minimumDistance);

        fare += succeedingKilometers * rate.succeedingRate;
    }

    return fare;
}


function applyDiscount(fare, passenger) {

    const discountRate = discounts[passenger] || 0;

    return {
        discountRate,
        discountAmount: fare * discountRate,
        finalFare: fare * (1 - discountRate)
    };
}


// ------------------------------------------
// 8. MAIN FARE CALCULATOR
// ------------------------------------------

async function calculateFare() {

    const button = document.getElementById("check-fare");
    const result = document.getElementById("fare-result");

    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const transport = document.getElementById("transport").value;
    const passenger = document.getElementById("passenger").value;

    const busType = document.getElementById("bus-type").value;
    const tricycleType = document.getElementById("tricycle-type").value;

    if (!origin || !destination || !transport) {
        result.innerHTML = "<p>Please complete your trip details.</p>";
        return;
    }

    if (origin === destination) {
        result.innerHTML = "<p>Please select two different barangays.</p>";
        return;
    }

    button.disabled = true;
    button.textContent = "Calculating...";

    try {

        const discount = discounts[passenger] || 0;

        // TRICYCLE FARE

        if (transport === "tricycle") {

            if (tricycleType === "special") {

                const minimum = fareRates.tricycle.specialMin;
                const maximum = fareRates.tricycle.specialMax;

                const discountedMinimum = minimum * (1 - discount);
                const discountedMaximum = maximum * (1 - discount);

                result.innerHTML = `
                    <h3>Tricycle Fare Estimate</h3>
                    <p><strong>Origin:</strong> ${origin}</p>
                    <p><strong>Destination:</strong> ${destination}</p>
                    <p><strong>Transportation:</strong> Tricycle</p>
                    <p><strong>Fare Type:</strong> Special (Exclusive Ride)</p>
                    <p><strong>Passenger:</strong> ${passengerNames[passenger]}</p>

                    <hr>

                    <p>Reported Regular Fare: ₱${minimum}–₱${maximum}</p>
                    <p>Discount Reference: ${(discount * 100).toFixed(0)}%</p>

                    <h3>
                        Estimated Fare: ₱${discountedMinimum.toFixed(2)}
                        – ₱${discountedMaximum.toFixed(2)}
                    </h3>

                    <small>
                        Based on locally reported fare estimates.
                        Confirm the agreed fare and applicable discount
                        with the operator. Not an official tariff.
                    </small>
                `;

            } else {

                const passengers = fareRates.tricycle.hatiPassengers;
                const perPassenger = fareRates.tricycle.hatiPerPassenger;

                const totalFare = perPassenger * passengers;

                const discountedPerPassenger =
                    perPassenger * (1 - discount);

                const discountedTotal =
                    totalFare * (1 - discount);

                result.innerHTML = `
                    <h3>Tricycle Fare Estimate</h3>
                    <p><strong>Origin:</strong> ${origin}</p>
                    <p><strong>Destination:</strong> ${destination}</p>
                    <p><strong>Transportation:</strong> Tricycle</p>
                    <p><strong>Fare Type:</strong> Hati (Shared Ride)</p>
                    <p><strong>Passengers:</strong> ${passengers}</p>
                    <p><strong>Passenger:</strong> ${passengerNames[passenger]}</p>

                    <hr>

                    <p>Reported Fare per Passenger: ₱${perPassenger.toFixed(2)}</p>
                    <p>Total Regular Fare: ₱${totalFare.toFixed(2)}</p>
                    <p>Discount Reference: ${(discount * 100).toFixed(0)}%</p>

                    <h3>
                        Fare per Passenger: ₱${discountedPerPassenger.toFixed(2)}
                    </h3>

                    <h3>
                        Total Fare: ₱${discountedTotal.toFixed(2)}
                    </h3>

                    <small>
                        Based on the locally reported ₱15 per passenger
                        for a four-passenger shared ride. Confirm the
                        applicable tariff and discount with the operator.
                    </small>
                `;
            }

            return;
        }


        // JEEPNEY, E-JEEPNEY, AND BUS FARES

        result.innerHTML = "<p>Finding estimated road distance...</p>";

        const distance = await getRoadDistance(origin, destination);

        let rate;
        let classification = "";

        if (transport === "jeepney") {

            rate = fareRates.jeepney;

        } else if (transport === "e-jeepney") {

            rate = fareRates["e-jeepney"];
            classification = "Provisional modern jeepney reference";

        } else if (transport === "bus") {

            rate = fareRates.bus[busType];

            if (!rate) {
                throw new Error("Bus classification unavailable.");
            }

            classification = rate.name;
        }

        const regularFare = calculateDistanceFare(distance, rate);

        const fareResult = applyDiscount(regularFare, passenger);

        result.innerHTML = `
            <h3>Fare Estimate</h3>

            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Transportation:</strong> ${transportNames[transport]}</p>

            ${classification ? `
                <p><strong>Classification:</strong> ${classification}</p>
            ` : ""}

            <p><strong>Passenger:</strong> ${passengerNames[passenger]}</p>

            <hr>

            <p>Estimated Road Distance: ${distance.toFixed(2)} km</p>
            <p>Regular Fare: ₱${regularFare.toFixed(2)}</p>
            <p>Discount Reference: ${(fareResult.discountRate * 100).toFixed(0)}%</p>
            <p>Discount Amount: ₱${fareResult.discountAmount.toFixed(2)}</p>

            <h3>Estimated Fare: ₱${fareResult.finalFare.toFixed(2)}</h3>

            <small>
                This is an estimate based on road distance between
                barangay-level location results. It may differ from
                actual public transport routes and approved fare
                matrices. Verify the fare with the operator.
            </small>
        `;

    } catch (error) {

        result.innerHTML = `
            <h3>Unable to Calculate Fare</h3>
            <p>
                We couldn't retrieve the estimated road distance
                for this trip.
            </p>
            <small>
                Please try again later. The location or routing
                service may be temporarily unavailable.
            </small>
        `;

        console.error("FareFair calculation error:", error);

    } finally {

        button.disabled = false;
        button.textContent = "Check Fare";
    }
}


// ------------------------------------------
// 9. INTERACTIVE MAP
// ------------------------------------------



function initializeMap() {
    const mapElement = document.getElementById("farefair-map");

    if (!mapElement) {
        console.warn("FareFair map container was not found.");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet did not load.");
        mapElement.innerHTML = "<p>Map is temporarily unavailable.</p>";
        return;
    }

    if (mapElement._leaflet_id) {
        return;
    }

    // San Mateo map viewing boundaries
    const sanMateoBounds = L.latLngBounds(
        [14.652484, 121.111299],
        [14.723037, 121.207844]
    );

    const farefairMap = L.map(mapElement, {
        maxBounds: sanMateoBounds,
        maxBoundsViscosity: 1,
        minZoom: 12,
        maxZoom: 19,
        zoomSnap: 0.5
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(farefairMap);

    // Existing terminals — names and coordinates unchanged
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

    // Larger pink clickable pins
    terminals.forEach(terminal => {
        const pinkPin = L.divIcon({
            className: "pink-terminal-marker",
            html: `
                <div class="pink-pin">
                    <span>📍</span>
                </div>
            `,
            iconSize: [64, 72],
            iconAnchor: [32, 68],
            popupAnchor: [0, -65]
        });

        L.marker(terminal.coords, {
            icon: pinkPin
        })
        .addTo(farefairMap)
        .bindPopup(`
            <div class="terminal-popup">
                <strong>${terminal.name}</strong>
                <p>${terminal.type} Terminal</p>
                <small>${terminal.area}</small>
            </div>
        `);
    });

    // Start closer to San Mateo
    farefairMap.fitBounds(sanMateoBounds, {
        padding: [20, 20],
        maxZoom: 13
    });

    setTimeout(() => {
        farefairMap.invalidateSize();
    }, 300);
}



// ------------------------------------------
// 10. START WEBSITE
// ------------------------------------------

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initializeFareFair);

} else {

    initializeFareFair();

}
