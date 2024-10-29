const urlPatient = 'https://localhost:44376/api/patient';
const urlBilling = 'https://localhost:44376/api/billing';
const urlRecord = `https://localhost:44376/api/patientrecord`;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');

    if (patientId) {
        fetchPatientData(patientId);
        setupDeleteButton(patientId); 
    } else {
        console.error('No patientId found in URL parameters');
    }
});

async function fetchPatientData(patientId) {
    try {
        const billingUrl = `${urlBilling}?patientId=${patientId}`;
        const recordUrl = `${urlRecord}?patientId=${patientId}`;

        console.log('Fetching Billing Data from:', billingUrl);
        console.log('Fetching Record Data from:', recordUrl);

        const [patientResponse, billingResponse, recordResponse] = await Promise.all([
            fetch(`${urlPatient}/${patientId}`),
            fetch(billingUrl),
            fetch(recordUrl)
        ]);

        if (!patientResponse.ok || !billingResponse.ok || !recordResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const [patient, billing, record] = await Promise.all([
            patientResponse.json(),
            billingResponse.json(),
            recordResponse.json()
        ]);

        console.log('Patient Data:', patient);
        console.log('Billing Data:', billing);
        console.log('Record Data:', record);

        // Combine data for the specific patient
        const combinedData = combineData(patient, billing, record);
        console.log('Combined Data:', combinedData);

        // Render the combined data
        populatePatientInfo(combinedData, patientId);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function combineData(patient, billing, record) {
    const patientBilling = billing.length > 0 ? billing[0] : {};
    const patientRecord = record.length > 0 ? record[0] : {};
    return { ...patient, ...patientBilling, ...patientRecord };
}

function populatePatientInfo(patient, patientId) {
    const patientProfileContainer = document.querySelector('.patient-profile-container');
    if (!patientProfileContainer) {
        console.error('Patient profile container not found');
        return;
    }
    patientProfileContainer.innerHTML = ''; // Clear any existing content

    // Add the header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-container');
    headerDiv.innerHTML = `
        <h3>Informacije o pacijentu</h3>
        <i id="deletePatientButton" class="fas fa-trash-alt delete-icon" title="Obriši pacijenta"></i>
    `;
    patientProfileContainer.appendChild(headerDiv);

    const patientDiv = document.createElement('div');
    patientDiv.classList.add('patient-info');

    // Log patient data to verify
    console.log('Rendering patient:', patient);
    const nameStyle = patient.isCritical ? 'style="color: red;"' : '';

    const birthYear = new Date(patient.yearOfBirth).getFullYear();

    patientDiv.innerHTML = `
        <div class="personal-info">
            <h4>Lične informacije</h4>
            <div class="info-row">
                <span class="info-label">Ime (ime oca) prezime:</span>
                <span class="info-value" ${nameStyle}>${patient.fullName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Godina rođenja:</span>
                <span class="info-value">${birthYear}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Mjesto rođenja:</span>
                <span class="info-value">${patient.placeOfBirth}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresa stanovanja:</span>
                <span class="info-value">${patient.postalAddress}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Broj telefona:</span>
                <span class="info-value">${patient.phoneNumber}</span>
            </div>
            <div class="info-row">
                <span class="info-label">JMBG:</span>
                <span class="info-value">${patient.jmbg}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${patient.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Critical:</span>
                <span class="info-value">${patient.isCritical ? 'Yes' : 'No'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Napomena:</span>
                <span class="info-value">${patient.patientNote}</span>
            </div>
        </div>
        <div class="medical-info">
            <h4>Medicinski karton</h4>
            <div class="info-row">
                <span class="info-label">Protetski rad:</span>
                <span class="info-value">${patient.dentalProsthetics || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Preležane bolesti:</span>
                <span class="info-value">${patient.previousDiseases || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hronične bolesti:</span>
                <span class="info-value">${patient.chronicDiseases || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Alergije:</span>
                <span class="info-value">${patient.allergies || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Penicilin:</span>
                <span class="info-value">${patient.penicilinAllergy || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Napomena:</span>
                <span class="info-value">${patient.recordNote || 'N/A'}</span>
            </div>
        </div>
        <div class="billing-info">
            <h4>Detalji o plaćanju</h4>
            <div class="info-row">
                <span class="info-label">Metoda plaćanja:</span>
                <span class="info-value">${patient.paymentMethod || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Uplaćeno:</span>
                <span class="info-value">${patient.currentAmount || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Datum zadnje uplate:</span>
                <span class="info-value">${new Date(patient.dateOfLastPayment).toLocaleDateString() || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ostalo za isplatiti:</span>
                <span class="info-value">${patient.remainingAmount || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status dugovanja:</span>
                <span class="info-value">${patient.billingStatus || 'N/A'}</span>
            </div>
        </div>
        <div class="opg-info">
            <h4>OPG snimci</h4>
            <div class="info-row">
                <span class="info-label">OPG Slika:</span>
                <span class="info-value"><img src="https://localhost:44376/api/patientrecord/${patient.patientRecordId}/opg" alt="OPG Image" style="max-width: 100%;"></span>
            </div>
        </div>
    `;

    patientProfileContainer.appendChild(patientDiv);

    // Set up the delete button
    setupDeleteButton(patientId);
}

function setupDeleteButton(patientId) {
    const deleteButton = document.getElementById('deletePatientButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            if (confirm('Da li ste sigurni da želite obrisati ovog pacijenta?')) {
                deletePatient(patientId);
            }
        });
    }
}

async function deletePatient(patientId) {
    try {
        const response = await fetch(`${urlPatient}/${patientId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        window.location.href = 'patients.html';
    } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Došlo je do greške prilikom brisanja pacijenta.');
    }
}

