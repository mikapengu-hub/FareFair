
// FareFair - San Mateo, Rizal
// DEMONSTRATION VERSION - Sample fares are NOT official fares.

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
    "jeepney": "Jeepney",
    "e-jeepney": "E-Jeepney",
    "bus": "Bus",
    "tricycle": "Tricycle"
};

// FICTIONAL SAMPLE DATA FOR WEBSITE DEMONSTRATION ONLY.
// These are not confirmed routes or official transportation fares.

const demoRoutes = [
    {
        origin: "Ampid I",
        destination: "Ampid II",
        fares: {
            "jeepney": 15,
            "e-jeepney": 16,
            "bus": 18,
            "tricycle": 35
        }
    },
    {
        origin: "Banaba",
        destination: "Santa Ana",
        fares: {
            "jeepney": 16,
            "e-jeepney": 17,
            "bus": 19,
            "tricycle": 40
        }
    },
    {
        origin: "Dulong Bayan I",
        destination: "Dulong Bayan II",
        fares: {
            "jeepney": 15,
            "e-jeepney": 16,
            "bus": 18,
            "tricycle": 35
        }
    },
    {
        origin: "Guitnang Bayan I",
        destination: "Guitnang Bayan II",
        fares: {
            "jeepney": 15,
            "e-jeepney": 16,
            "bus": 18,
            "tricycle": 35
        }
    },
    {
        origin: "Malanday",
        destination: "Maly",
        fares: {
            "jeepney": 17,
            "e-jeepney": 18,
            "bus": 20,
            "tricycle": 45
        }
    },
    {
        origin: "Silangan",
        destination: "Gulod Malaya",
        fares: {
            "jeepney": 18,
            "e-jeepney": 19,
            "bus": 21,
            "tricycle": 50
        }
    }
];

// Demonstration discount rates.
// Actual eligibility and applicability depend on the law and trip.

const discounts = {
    regular: 0,
    student: 0.20,
    senior: 0.20,
    pwd: 0.20
};

const passengerNames = {
    regular: "Regular passenger",
    student: "Student",
    senior: "Senior citizen",
    pwd: "Person with disability (PWD)"
};

function barangayOptions() {
    return barangays.map(name =>
        `<option value="${name}">${name}</option>`
    ).join("");
}

calculator.innerHTML = `
    <h3>Check Your Transportation Fare</h3>

    <p class="demo-notice">
        DEMO VERSION: Sample fares are for website demonstration
        only and are not official transportation rates.
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
        <option value="regular">Regular passenger</option>
        <option value="student">Student</option>
        <option value="senior">Senior citizen</option>
        <option value="pwd">Person with disability (PWD)</option>
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
            <p>Please choose two different barangays.</p>
        `;
        return;
    }

    const route = demoRoutes.find(item =>
        (item.origin === origin && item.destination === destination) ||
        (item.origin === destination && item.destination === origin)
    );

    if (!route) {
        result.innerHTML = `
            <h3>No Sample Route Available</h3>
            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Transportation:</strong> ${transportNames[transport]}</p>
            <p>This route is not yet included in our demonstration database.</p>
            <p>More sample routes can be added as the website develops.</p>
        `;
        return;
    }

    const regularFare = route.fares[transport];

    if (typeof regularFare !== "number") {
        result.innerHTML = `
            <p>No sample fare is available for this transportation type.</p>
        `;
        return;
    }

    const discountRate = discounts[passenger];
    const discountAmount = regularFare * discountRate;
    const finalFare = regularFare - discountAmount;

    result.innerHTML = `
        <h3>Fare Estimate</h3>

        <p><strong>Origin:</strong> ${origin}</p>
        <p><strong>Destination:</strong> ${destination}</p>
        <p><strong>Transportation:</strong> ${transportNames[transport]}</p>
        <p><strong>Passenger:</strong> ${passengerNames[passenger]}</p>

        <hr>

        <p>Regular fare: ₱${regularFare.toFixed(2)}</p>
        <p>Discount: ${(discountRate * 100).toFixed(0)}%</p>
        <p>Discount amount: ₱${discountAmount.toFixed(2)}</p>

        <h3>Estimated Fare: ₱${finalFare.toFixed(2)}</h3>

        <small>
            Demonstration data only. This is not an official fare quotation.
            Actual fares and discount eligibility may vary.
        </small>
    `;
});
