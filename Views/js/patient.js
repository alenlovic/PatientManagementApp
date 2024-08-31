
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

documt.addEventListener("DOMContentLoaded", (event) => {
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

