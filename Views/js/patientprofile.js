const urlPatient = 'https://localhost:44376/api/patient';
const urlBilling = 'https://localhost:44376/api/billing';
const urlRecord = `https://localhost:44376/api/patientrecord`;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');

    if (patientId) {
        fetchPatientData(patientId);
    } else {
        console.error('No patientId found in URL parameters');
    }

    // Get the modal
    var modal = document.getElementById("editModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    if (span) {
        span.onclick = function () {
            modal.style.display = "none";
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Get the modal
    var medicalModal = document.getElementById("editMedicalModal");

    // Get the <span> element that closes the modal
    var medicalSpan = medicalModal.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    if (medicalSpan) {
        medicalSpan.onclick = function () {
            medicalModal.style.display = "none";
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == medicalModal) {
            medicalModal.style.display = "none";
        }
    }
});

function setupEditButton(patientId, patient) {
    const editButton = document.getElementById('editPatientButton');
    if (editButton) {
        editButton.addEventListener('click', () => {
            openEditPopup(patientId, patient);
        });
    }

    const editMedicalButton = document.getElementById('editMedicalButton');
    if (editMedicalButton) {
        editMedicalButton.addEventListener('click', () => {
            openEditMedicalPopup(patient);
        });
    }
}

function openEditPopup(patientId, patient) {
    const modal = document.getElementById("editModal");
    const form = document.getElementById("editPatientForm");

    // Populate the form with patient data
    form.fullName.value = patient.fullName;
    form.yearOfBirth.value = new Date(patient.yearOfBirth).getFullYear();
    form.placeOfBirth.value = patient.placeOfBirth;
    form.postalAddress.value = patient.postalAddress;
    form.phoneNumber.value = patient.phoneNumber;
    form.jmbg.value = patient.jmbg;
    form.email.value = patient.email;
    form.patientNote.value = patient.patientNote;

    // Show the modal
    modal.style.display = "flex";
}

async function savePatientData() {
    const form = document.getElementById('editPatientForm');
    const formData = new FormData(form);
    const patientData = {};
    formData.forEach((value, key) => {
        patientData[key] = value;
    });

    try {
        const response = await fetch(`${urlPatient}/${patientData.patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Refresh the patient data
        fetchPatientData(patientData.patientId);
    } catch (error) {
        console.error('Error saving patient data:', error);
        alert('Došlo je do greške prilikom čuvanja podataka.');
    }
}


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

function populatePatientInfo(combinedData, patientId) {
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
    console.log('Rendering patient:', combinedData);
    const nameStyle = combinedData.isCritical ? 'style="color: red;"' : '';

    const birthYear = new Date(combinedData.yearOfBirth).getFullYear();

    patientDiv.innerHTML = `
        <div class="personal-info-patient">
            <h4>Lične informacije</h4>
            <hr>
            <i id="editPatientButton" class="fas fa-edit edit-icon" title="Uredi informacije"></i>
            <div class="info-row">
                <span class="info-label">Ime (ime oca) prezime:</span>
                <span class="info-value" ${nameStyle}>${combinedData.fullName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Godina rođenja:</span>
                <span class="info-value">${birthYear}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Mjesto rođenja:</span>
                <span class="info-value">${combinedData.placeOfBirth}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresa stanovanja:</span>
                <span class="info-value">${combinedData.postalAddress}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Broj telefona:</span>
                <span class="info-value">${combinedData.phoneNumber}</span>
            </div>
            <div class="info-row">
                <span class="info-label">JMBG:</span>
                <span class="info-value">${combinedData.jmbg}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${combinedData.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Critical:</span>
                <span class="info-value">${combinedData.isCritical ? 'Yes' : 'No'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Napomena:</span>
                <span class="info-value">${combinedData.patientNote}</span>
            </div>
        </div>
        <div class="personal-info-patient">
            <h4>Medicinski karton</h4>
            <hr>
            <i id="editMedicalButton" class="fas fa-edit edit-icon" title="Uredi medicinski karton"></i>
            <div class="info-row">
                <span class="info-label">Protetski rad:</span>
                <span class="info-value">${combinedData.dentalProsthetics || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Preležane bolesti:</span>
                <span class="info-value">${combinedData.previousDiseases || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hronične bolesti:</span>
                <span class="info-value">${combinedData.chronicDiseases || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Alergije:</span>
                <span class="info-value">${combinedData.allergies || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Penicilin:</span>
                <span class="info-value">${combinedData.penicilinAllergy || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Napomena:</span>
                <span class="info-value">${combinedData.recordNote || 'N/A'}</span>
            </div>
        </div>
        <div class="billing-info">
            <h4>Detalji o plaćanju</h4>
            <div class="info-row">
                <span class="info-label">Metoda plaćanja:</span>
                <span class="info-value">${combinedData.paymentMethod || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Uplaćeno:</span>
                <span class="info-value">${combinedData.currentAmount || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Datum zadnje uplate:</span>
                <span class="info-value">${new Date(combinedData.dateOfLastPayment).toLocaleDateString() || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ostalo za isplatiti:</span>
                <span class="info-value">${combinedData.remainingAmount || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status dugovanja:</span>
                <span class="info-value">${combinedData.billingStatus || 'N/A'}</span>
            </div>
        </div>
        <div class="opg-info">
            <h4>OPG snimci</h4>
            <div class="info-row">
                <span class="info-label">OPG Slika:</span>
                <span class="info-value"><img src="" alt="OPG Image" style="max-width: 100%;"></span>
            </div>
        </div>
    `;

    patientProfileContainer.appendChild(patientDiv);

    setupDeleteButton(patientId);
    setupEditButton(patientId, combinedData); // Ensure this is called with the correct data
}


function setupDeleteButton(patientId) {
    const deleteButton = document.getElementById('deletePatientButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            const confirmation = confirm('Are you sure you want to delete this patient?');
            if (confirmation) {
                try {
                    const response = await fetch(`${urlPatient}/${patientId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    alert('Patient deleted successfully.');
                    window.location.href = '/patients'; // Redirect to the patients list page
                } catch (error) {
                    console.error('Error deleting patient:', error);
                    alert('An error occurred while deleting the patient.');
                }
            }
        });
    }
}

function openEditMedicalPopup(patient) {
    const modal = document.getElementById("editMedicalModal");
    const form = document.getElementById("editMedicalForm");

    // Populate the form with medical record data
    form.dentalProsthetics.value = patient.dentalProsthetics || '';
    form.previousDiseases.value = patient.previousDiseases || '';
    form.chronicDiseases.value = patient.chronicDiseases || '';
    form.allergies.value = patient.allergies || '';
    form.penicilinAllergy.value = patient.penicilinAllergy || '';
    form.recordNote.value = patient.recordNote || '';

    // Show the modal
    modal.style.display = "flex";
}

async function saveMedicalData() {
    const form = document.getElementById('editMedicalForm');
    const formData = new FormData(form);
    const medicalData = {};
    formData.forEach((value, key) => {
        medicalData[key] = value;
    });

    try {
        const response = await fetch(`${urlRecord}/${medicalData.patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicalData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Refresh the patient data
        fetchPatientData(medicalData.patientId);
    } catch (error) {
        console.error('Error saving medical data:', error);
        alert('Došlo je do greške prilikom čuvanja medicinskih podataka.');
    }
}
