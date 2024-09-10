
const urlPatient = 'https://localhost:44376/api/patient';
const urlBilling = 'https://localhost:44376/api/billing';
const urlRecord = `https://localhost:44376/api/patientrecord`;

document.addEventListener('DOMContentLoaded', () => {
    fetchAllPatientsData();
});

async function fetchAllPatientsData() {
    try {
        const [patientsResponse, billingResponse, recordsResponse] = await Promise.all([
            fetch(urlPatient),
            fetch(urlBilling),
            fetch(urlRecord)
        ]);

        if (!patientsResponse.ok || !billingResponse.ok || !recordsResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const [patients, billing, records] = await Promise.all([
            patientsResponse.json(),
            billingResponse.json(),
            recordsResponse.json()
        ]);

        console.log('All patients data:', patients);
        console.log('All billing data:', billing);
        console.log('All records data:', records);

        const combinedData = combineData(patients, billing, records);
        populateAllPatientsInfo(combinedData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function combineData(patients, billing, records) {
    return patients.map(patient => {
        const patientBilling = billing.find(b => b.patientId === patient.id) || {};
        const patientRecord = records.find(r => r.patientId === patient.id) || {};
        return { ...patient, ...patientBilling, ...patientRecord };
    });
}

function populateAllPatientsInfo(patients) {
    const patientProfileContainer = document.querySelector('.patient-profile-container');
    patientProfileContainer.innerHTML = ''; // Clear any existing content

    // Add the header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-container');
    headerDiv.innerHTML = `<h3>Patient Profile</h3>`;
    patientProfileContainer.appendChild(headerDiv);

    patients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.classList.add('patient-info');

        patientDiv.innerHTML = `
            <div class="personal-info">
                <h4>Personal Information</h4>
                <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${patient.fullName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">${new Date(patient.yearOfBirth).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Place of Birth:</span>
                    <span class="info-value">${patient.placeOfBirth}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Postal Address:</span>
                    <span class="info-value">${patient.postalAddress}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone Number:</span>
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
                    <span class="info-label">Notes:</span>
                    <span class="info-value">${patient.patientNote}</span>
                </div>
            </div>
            <div class="medical-info">
                <h4>Medical Information</h4>
                <div class="info-row">
                    <span class="info-label">Dental Prosthetics:</span>
                    <span class="info-value">${patient.dentalProsthetics}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Previous Diseases:</span>
                    <span class="info-value">${patient.previousDiseases}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Chronic Diseases:</span>
                    <span class="info-value">${patient.chronicDiseases}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Allergies:</span>
                    <span class="info-value">${patient.allergies}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Penicilin Allergy:</span>
                    <span class="info-value">${patient.penicilinAllergy}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Note:</span>
                    <span class="info-value">${patient.recordNote}</span>
                </div>
            </div>
            <div class="billing-info">
                <h4>Billing Information</h4>
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${patient.paymentMethod}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Current Amount:</span>
                    <span class="info-value">${patient.currentAmount}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date of Last Payment:</span>
                    <span class="info-value">${new Date(patient.dateOfLastPayment).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Remaining Amount:</span>
                    <span class="info-value">${patient.remainingAmount}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Billing Status:</span>
                    <span class="info-value">${patient.billingStatus}</span>
                </div>
            </div>
            <div class="opg-info">
                <h4>OPG Records</h4>
                <div class="info-row">
                    <span class="info-label">OPG Image:</span>
                    ${patient.opg ? `<img src="data:image/png;base64,${patient.opg}" alt="OPG Image" class="opg-image" />` : 'No OPG Image'}
                </div>
            </div>
        `;

        patientProfileContainer.appendChild(patientDiv);
    });
}
