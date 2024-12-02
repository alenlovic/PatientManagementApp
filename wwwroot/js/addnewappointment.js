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
    const personalName = document.getElementById("personalName").value.trim();
    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentNote = document.getElementById("appointmentNote").value;

    const dateObj = new Date(appointmentDate);
    
    if (!personalName || !appointmentDate) {
        alert('Personal name and appointment date are required.');
        return;
    }

    console.log(`Searching for patient: ${personalName}`); // Log the input patient name

    const apiUrl = `https://localhost:44376/api/patient/search?name=${encodeURIComponent(personalName)}`;
    console.log(`API URL: ${apiUrl}`); // Log the API URL

    // Fetch the patient details to get the PatientId
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data); // Log the response data

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Patient not found');
            }

            // Find the patient with a case-insensitive match
            const patient = data.find(p => p.personalName.toLowerCase() === personalName.toLowerCase());

            if (!patient) {
                throw new Error('Patient not found');
            }

            const appointment = {
                PatientId: patient.patientId,
                AppointmentDate: new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString(),  // Slanje u lokalnom vremenu
                AppointmentNote: appointmentNote,
                CreatedAt: new Date().toISOString()
            };

            console.log('Appointment data being sent:', appointment);

            // Send the appointment data to the server
            return fetch('https://localhost:44376/api/patientappointment/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointment)
            });
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            modal.style.display = "none"; // Close the modal
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(error.message); // Display the error message to the user
        });
});