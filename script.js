
// FareFair - San Mateo, Rizal

const calculator = document.getElementById("calculator-content");

// Fare records will be added only after official verification.
const fareRecords = [];

calculator.innerHTML = `
    <h3>Check Your Transportation Fare</h3>

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

    <div id="fare-result" aria-live="polite"></div>
`;

document.getElementById("check-fare").addEventListener("click", function () {
    const transport = document.getElementById("transport").value;
    const passenger = document.getElementById("passenger").value;
    const result = document.getElementById("fare-result");

    if (!transport) {
        result.textContent = "Please select a transportation type.";
        return;
    }

    const fare = fareRecords.find(record =>
        record.transport === transport
    );

    if (!fare) {
        result.innerHTML = `
            <h3>Fare not yet verified</h3>
            <p>
                We are still gathering official ${transport}
                fare information for San Mateo, Rizal.
            </p>
            <p>Please check again once verified data is available.</p>
        `;
        return;
    }

    // Discount calculation will use verified fare rules.
    const discount = fare.discounts[passenger];

    if (typeof discount !== "number") {
        result.textContent =
            "Discount information is not yet verified for this fare.";
        return;
    }

    const finalFare = fare.regularFare * (1 - discount);

    result.innerHTML = `
        <h3>Fare Information</h3>
        <p>Regular fare: ₱${fare.regularFare.toFixed(2)}</p>
        <p>Discount: ${(discount * 100).toFixed(0)}%</p>
        <p>Estimated discounted fare: ₱${finalFare.toFixed(2)}</p>
        <small>Source: ${fare.source}</small>
    `;
});
