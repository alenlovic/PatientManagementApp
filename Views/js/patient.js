
const urlPatient = "https://localhost:44376/api/patient";

const firstName = document.getElementById("firstName"); 
const fathersName = document.getElementById("fathersName");
const lastName = document.getElementById("lastName");
const fullName = document.getElementById("fullName");
const yearOfBirth = document.getElementById("yearOfBirth");
const placeOfBirth = document.getElementById("placeOfBirth");
const postalAddress = document.getElementById("postalAddress");
const phoneNumber = document.getElementById("phoneNumber");
const jmbg = document.getElementById("jmbg");
const email = document.getElementById("email");
const isCritical = document.getElementById("isCritical");
const note = document.getElementById("note");


function getAllPatients() {
    fetch(urlPatient)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => displayAllPatients(data))
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

document.addEventListener("DOMContentLoaded", (event) => {
    getAllPatients();
});

function displayAllPatients(patients) {
    const tableBody = document.getElementById("patientsTable").getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";

    if (patients.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `<td colspan="12" style="text-align:center;">No patients found</td>`;
        return;
    }

    patients.forEach(patient => {
        const row = tableBody.insertRow();
        row.innerHTML = `
        <td>${patient.fullName}</td>
        <td>${patient.yearOfBirth}</td>
        <td>${patient.placeOfBirth}</td>
        <td>${patient.postalAddress}</td>
        <td>${patient.phoneNumber}</td>
        <td>${patient.jmbg}</td>
        <td>${patient.email}</td>
        <td>${patient.isCritical}</td>
        <td>${patient.note}</td>
    `;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    getAllPatients();

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
        const patientPersonalName = document.getElementById("patientPersonalName").value;
        const appointmentDate = document.getElementById("appointmentDate").value;
        const appointmentNote = document.getElementById("appointmentNote").value;

        // Create the appointment object
        const appointment = {
            patientPersonalName: patientPersonalName,
            appointmentDate: appointmentDate,
            appointmentNote: appointmentNote,
            createdAt: new Date().toISOString()
        };

        // Send the appointment data to the server (example using fetch)
        fetch('https://localhost:44376/api/patientappointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointment)
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

    // Autocomplete functionality
    const patientInput = document.getElementById("patientPersonalName");
    patientInput.addEventListener("input", function () {
        const query = this.value;
        if (query.length < 2) {
            closeAllLists();
            return;
        }

        fetch(`https://localhost:44376/api/patient/search?name=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                closeAllLists();
                const autocompleteList = document.createElement("div");
                autocompleteList.setAttribute("id", "autocomplete-list");
                autocompleteList.setAttribute("class", "autocomplete-items");
                this.parentNode.appendChild(autocompleteList);

                data.forEach(patient => {
                    const item = document.createElement("div");
                    item.innerHTML = `<strong>${patient.personalName.substr(0, query.length)}</strong>${patient.personalName.substr(query.length)}`;
                    item.addEventListener("click", function () {
                        patientInput.value = patient.personalName;
                        closeAllLists();
                    });
                    autocompleteList.appendChild(item);
                });
            })
            .catch(error => console.error('Error fetching patient names:', error));
    });

    function closeAllLists(elmnt) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (elmnt != items[i] && elmnt != patientInput) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
});




