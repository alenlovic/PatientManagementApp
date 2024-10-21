
const urlPatient = 'https://localhost:44376/api/patient';
const urlBilling = 'https://localhost:44376/api/billing';
const urlRecord = `https://localhost:44376/api/patientrecord`;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');

    if (patientId) {
        fetchPatientData(patientId);
    } else {
        fetchAllPatientsData();
    }
});

async function fetchPatientData(patientId) {
    try {
        const [patientResponse, billingResponse, recordResponse] = await Promise.all([
            fetch(`${urlPatient}/${patientId}`),
            fetch(`${urlBilling}?patientId=${patientId}`),
            fetch(`${urlRecord}?patientId=${patientId}`)
        ]);

        if (!patientResponse.ok || !billingResponse.ok || !recordResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const [patient, billing, record] = await Promise.all([
            patientResponse.json(),
            billingResponse.json(),
            recordResponse.json()
        ]);

        // Filter billing and record data for the specific patient
        const filteredBilling = billing.filter(b => b.patientId === parseInt(patientId));
        const filteredRecord = record.filter(r => r.patientId === parseInt(patientId));

        // Log the responses to verify the data
        console.log('Patient Data:', patient);
        console.log('Billing Data:', filteredBilling);
        console.log('Record Data:', filteredRecord);

        const combinedData = combineData(patient, filteredBilling, filteredRecord);
        console.log('Combined Data:', combinedData); // Log combined data

        populateAllPatientsInfo([combinedData]); // Pass as an array
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function combineData(patient, billing, record) {
    const patientBilling = billing.length > 0 ? billing[0] : {};
    const patientRecord = record.length > 0 ? record[0] : {};
    return { ...patient, ...patientBilling, ...patientRecord };
}



function populateAllPatientsInfo(patients) {
    const patientProfileContainer = document.querySelector('.patient-profile-container');
    if (!patientProfileContainer) {
        console.error('Patient profile container not found');
        return;
    }
    patientProfileContainer.innerHTML = ''; // Clear any existing content

    // Add the header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-container');
    headerDiv.innerHTML = `<h3>Informacije o pacijentu</h3>`;
    patientProfileContainer.appendChild(headerDiv);

    patients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.classList.add('patient-info');

        // Log patient data to verify
        console.log('Rendering patient:', patient);

        patientDiv.innerHTML = `
            <div class="personal-info">
                <h4>Lične informacije</h4>
                <div class="info-row">
                    <span class="info-label">Ime (ime oca) prezime:</span>
                    <span class="info-value">${patient.fullName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Godina rođenja:</span>
                    <span class="info-value">${new Date(patient.yearOfBirth).toLocaleDateString()}</span>
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
                    <span class="info-label">Snimak:</span>
                    ${patient.opg ? `<img src="data:image/png;base64,${patient.opg}" alt="OPG Image" class="opg-image" />` : 'No OPG Image'}
                </div>
            </div>
        `;

        patientProfileContainer.appendChild(patientDiv);
    });
}