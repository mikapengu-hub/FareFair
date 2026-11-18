
// FareFair - San Mateo, Rizal

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

const routeLeads = [
    {
        id: "SM-001",
        origin: "Silangan",
        destination: "San Mateo Public Terminal",
        transport: "modern-jeepney",
        source: "LTFRB Memorandum Circular No. 2024-010",
        sourceDate: "2024-05-07",
        sourceUrl: "https://naro.law.upd.edu.ph/issuances/3903",
        status: "for-verification",
        currentOperation: "unconfirmed",
        regularFare: null,
        notes: "Application notice only. Current operation and approved fare need confirmation."
    }
];

const fareRecords = [];

function barangayOptions() {
    return barangays.map(name =>
        `<option value="${name}">${name}</option>`
    ).join("");
}

calculator.innerHTML = `
    <h3>Check Your Transportation Fare</h3>

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

    <button id="check-fare">Check Fare</button>

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
        result.innerHTML =
            "<p>Please choose two different barangays.</p>";
        return;
    }

    const fare = fareRecords.find(record =>
        record.origin === origin &&
        record.destination === destination &&
        record.transport === transport
    );

    if (!fare) {
        result.innerHTML = `
            <h3>Route or fare not yet verified</h3>
            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Transportation:</strong> ${transport}</p>
            <p>We are still verifying this route and its official fare.</p>
            <p>Please check again when verified information becomes available.</p>
        `;
        return;
    }

    const discount = fare.discounts[passenger];

    if (typeof discount !== "number") {
        result.innerHTML =
            "<p>Discount information is not yet verified.</p>";
        return;
    }

    const finalFare = fare.regularFare * (1 - discount);

    result.innerHTML = `
        <h3>Verified Fare Information</h3>
        <p>Regular fare: ₱${fare.regularFare.toFixed(2)}</p>
        <p>Discount: ${(discount * 100).toFixed(0)}%</p>
        <p>Discounted fare: ₱${finalFare.toFixed(2)}</p>
        <small>Source: ${fare.source}</small>
    `;
});
