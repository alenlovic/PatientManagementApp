// Get the modal
const modal = document.getElementById("appointmentModal");

// Get the button that opens the modal
const btn = document.querySelector(".add-appointment");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Handle form submission
const form = document.getElementById("appointmentForm");
form.addEventListener("submit", function (event) {
    event.preventDefault();
    const personalName = document.getElementById("patientPersonalName").value.trim();
    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentNote = document.getElementById("appointmentNote").value;

    // Fetch the patient details to get the PatientId
    fetch(`https://localhost:44376/api/patient/search?name=${personalName}`)
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data); // Log the response data

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Patient not found');
            }

            const patient = data[0]; // Assuming the first match is the correct one
            const appointment = {
                PatientId: patient.PatientId,
                AppointmentDate: appointmentDate,
                AppointmentNote: appointmentNote,
                CreatedAt: new Date().toISOString()
            };

            // Send the appointment data to the server
            return fetch('https://localhost:44376/api/patientappointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointment)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            modal.style.display = "none"; // Close the modal
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
