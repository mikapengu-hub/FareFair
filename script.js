
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

// TRANSPORTATION FARE REFERENCES
// These are reference rates, not route-specific fare quotations.

const jeepneyFareReference = {
    minimumFare: 14,
    minimumDistance: 4,
    succeedingRate: 2
};

function barangayOptions() {
    return barangays.map(name =>
        `<option value="${name}">${name}</option>`
    ).join("");
}

if (calculator) {
    calculator.innerHTML = `
        <h3>Check Your Transportation Fare</h3>

        <p class="demo-notice">
            FareFair is working to provide accurate and verified
            transportation fare information within San Mateo, Rizal.
            Unverified route fares are not displayed as confirmed prices.
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

    document.getElementById("check-fare").addEventListener("click", function () {
        const origin = document.getElementById("origin").value;
        const destination = document.getElementById("destination").value;
        const transport = document.getElementById("transport").value;
        const passenger = document.getElementById("passenger").value;
        const result = document.getElementById("fare-result");

        if (!origin || !destination || !transport) {
            result.innerHTML = `
                <p>Please complete your trip details.</p>
            `;
            return;
        }

        if (origin === destination) {
            result.innerHTML = `
                <p>Please select two different barangays.</p>
            `;
            return;
        }

        let referenceMessage = "";

        if (transport === "jeepney") {
            referenceMessage = `
                <h4>Traditional Jeepney Fare Reference</h4>

                <p>
                    Minimum fare: ₱${jeepneyFareReference.minimumFare.toFixed(2)}
                    for the first ${jeepneyFareReference.minimumDistance} kilometers.
                </p>

                <p>
                    Succeeding distance: ₱${jeepneyFareReference.succeedingRate.toFixed(2)}
                    per kilometer.
                </p>

                <small>
                    This is a general fare reference, not the confirmed
                    fare for your selected route.
                </small>
            `;
        } else {
            referenceMessage = `
                <p>
                    The fare reference for this transportation type
                    is still being verified.
                </p>
            `;
        }

        const discountMessage =
            passenger === "regular"
                ? "Regular passenger fare rules apply."
                : "Eligible students, senior citizens, and PWDs may receive applicable fare discounts under existing regulations. Present the required identification or proof of eligibility.";

        result.innerHTML = `
            <h3>Fare Information</h3>

            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Transportation:</strong> ${transportNames[transport]}</p>
            <p><strong>Passenger Category:</strong> ${passengerNames[passenger]}</p>

            <hr>

            ${referenceMessage}

            <h3>Route Fare: Not Yet Verified</h3>

            <p>
                FareFair does not have a confirmed route-specific
                fare for this trip yet.
            </p>

            <p>${discountMessage}</p>

            <small>
                Please confirm the actual fare with the authorized
                transportation operator. FareFair will update its
                information as verified local fare data becomes available.
            </small>
        `;
    });
}


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


    // TERMINAL MARKERS
    // Coordinates are approximate area markers, not verified entrances.

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
            <small>Approximate area marker. Exact terminal entrance is subject to verification.</small>
        `);
    });


    // SHOW ALL TERMINAL MARKERS

    const terminalBounds = L.latLngBounds(
        terminals.map(terminal => terminal.coords)
    );

    farefairMap.fitBounds(terminalBounds, {
        padding: [30, 30]
    });
}
