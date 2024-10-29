const urlPatient = "https://localhost:44376/api/patient";

let currentPage = 1;
const rowsPerPage = 7;

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
/*const note = document.getElementById("note");*/

let allPatients = [];

function getAllPatients() {
    fetch(urlPatient)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            allPatients = data;
            displayAllPatients(data);
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function deletePatient(patientId) {
    fetch(`${urlPatient}/${patientId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Remove the patient from the list and re-display
            allPatients = allPatients.filter(patient => patient.patientId !== patientId);
            displayAllPatients(allPatients);
        })
        .catch(error => console.error('There has been a problem with your delete operation:', error));
}

function setupAutocomplete() {
    const patientInput = document.getElementById('personalName');
    const autocompleteList = document.getElementById('autocomplete-list-appointment');

    patientInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length < 2) {
            autocompleteList.innerHTML = '';
            autocompleteList.classList.remove('show');
            return;
        }

        fetch(`https://localhost:44376/api/patient/search?name=${query}`)
            .then(response => response.json())
            .then(data => {
                autocompleteList.innerHTML = '';
                if (data.length > 0) {
                    autocompleteList.classList.add('show');
                } else {
                    autocompleteList.classList.remove('show');
                }
                data.forEach(patient => {
                    const item = document.createElement('div');
                    item.textContent = patient.personalName;
                    item.classList.add('autocomplete-item');
                    item.addEventListener('click', function () {
                        patientInput.value = patient.personalName;
                        autocompleteList.innerHTML = '';
                        autocompleteList.classList.remove('show');
                    });
                    autocompleteList.appendChild(item);
                });
            })
            .catch(error => console.error('Error fetching patient names:', error));
    });
}

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
        row.setAttribute('data-id', patient.patientId);
        const nameStyle = patient.isCritical ? 'style="color: red;"' : '';

        const birthYear = new Date(patient.yearOfBirth).getFullYear();

        row.innerHTML = `
            <td ${nameStyle}>${patient.fullName}</td>
            <td>${birthYear}</td>
            <td>${patient.placeOfBirth}</td>
            <td>${patient.postalAddress}</td>
            <td>${patient.phoneNumber}</td>
            <td>${patient.jmbg}</td>
            <td>${patient.email}</td>
        `;
        row.addEventListener('click', () => {
            window.location.href = `patientprofile.html?patientId=${patient.patientId}`;
        });
    });

    displayTableRows();
}

function displayTableRows() {
    const table = document.getElementById('patientsTable').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    // Hide all rows
    for (let i = 0; i < totalRows; i++) {
        rows[i].style.display = 'none';
    }

    // Show only the rows for the current page
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    for (let i = start; i < end && i < totalRows; i++) {
        rows[i].style.display = '';
    }

    // Update page info
    document.getElementById('pageInfo').innerText = `Stranica ${currentPage} od ${totalPages}`;

    // Disable/Enable buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTableRows();
    }
}

function nextPage() {
    const table = document.getElementById('patientsTable').getElementsByTagName('tbody')[0];
    const totalRows = table.getElementsByTagName('tr').length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTableRows();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getAllPatients();
    setupAutocomplete();

    // Autocomplete functionality
    const searchBox = document.getElementById("searchBox");
    searchBox.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const filteredPatients = allPatients.filter(patient => patient.fullName.toLowerCase().includes(query));
        displayAllPatients(filteredPatients);
    });

    function closeAllLists(elmnt) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (elmnt != items[i] && elmnt != searchBox) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
});
