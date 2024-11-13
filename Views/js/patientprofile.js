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

    setupModal('editModal');
    setupModal('editMedicalModal');
    setupRtgUpload(patientId);
});

function setupModal(modalId) {
    const modal = document.getElementById(modalId);
    const span = modal.getElementsByClassName('close')[0];

    if (span) {
        span.onclick = function () {
            modal.style.display = 'none';
        }
    }

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }

    });
}

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

    form.fullName.value = patient.fullName;
    form.fullName.readOnly = true; // Make the field read-only
    form.fullName.style.backgroundColor = "#e9ecef"; // Gray out the field
    form.fullName.style.pointerEvents = "none"; // Make it unavailable for clicking

    form.yearOfBirth.value = new Date(patient.yearOfBirth).getFullYear();
    form.placeOfBirth.value = patient.placeOfBirth;
    form.postalAddress.value = patient.postalAddress;
    form.phoneNumber.value = patient.phoneNumber;
    form.jmbg.value = patient.jmbg;
    form.email.value = patient.email;
    form.patientNote.value = patient.patientNote;

    form.fullName.display = true;
    modal.style.display = "flex";
}

async function savePatientData() {
    const form = document.getElementById('editPatientForm');
    const formData = new FormData(form);
    const patientData = {};
    formData.forEach((value, key) => {
        patientData[key] = value;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    patientData.patientId = patientId

    // Extract firstName, lastName, and fathersName from fullName
    const fullName = form.fullName.value;
    const fullNameParts = fullName.split(' ');
    patientData.firstName = fullNameParts[0];
    patientData.lastName = fullNameParts[fullNameParts.length - 1];
    patientData.fathersName = fullNameParts.slice(1, -1).join(' ');

    if (patientData.yearOfBirth) {
        const year = parseInt(patientData.yearOfBirth, 10);
        patientData.yearOfBirth = new Date(Date.UTC(year, 0, 1)).toISOString();
    }

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

        const combinedData = combineData(patient, billing, record);
        console.log('Combined Data:', combinedData);

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

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-container');
    headerDiv.innerHTML = `
        <h3>Informacije o pacijentu</h3>
        <i id="deletePatientButton" class="fas fa-trash-alt delete-icon" title="Obriši pacijenta"></i>
    `;
    patientProfileContainer.appendChild(headerDiv);

    const patientDiv = document.createElement('div');
    patientDiv.classList.add('patient-info');

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
                <span class="info-label">SC:</span>
                <input type="checkbox" id="isCriticalCheckbox" ${combinedData.isCritical ? 'checked' : ''}>
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
        <div class="personal-info-patient">
            <h4>Detalji o plaćanju</h4>
            <hr>
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
        <div class="personal-info-patient rtg-upload">
            <div class="rtg-header">
            <h4>RTG snimci</h4>
            <i id="uploadRtgButton" class="fas fa-plus upload-icon" title="Upload RTG snimak"></i>
            </div>
            <hr>
            <div class="info-row">
            <span class="info-label">RTG Slika:</span>
            <span class="info-value"><img id="rtgImage" src="" alt="RTG Image" style="max-width: 100%;"></span>
            </div>
            <form id="rtgUploadForm" enctype="multipart/form-data" style="display: none;">
            <input type="file" id="rtgFileInput" name="file" accept="image/*">
            </form>
        </div>
    `;

    patientProfileContainer.appendChild(patientDiv);

    setupDeleteButton(patientId);
    setupEditButton(patientId, combinedData); // Ensure this is called with the correct data
    setupRtgUpload(patientId);

    // Add event listener for the critical checkbox
    const criticalCheckbox = document.getElementById('isCriticalCheckbox');
    if (criticalCheckbox) {
        criticalCheckbox.addEventListener('change', async () => {
            try {
                const isCritical = criticalCheckbox.checked;
                const urlParams = new URLSearchParams(window.location.search);
                const patientId = urlParams.get('patientId');

                const response = await fetch(`${urlPatient}/${patientId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([{ op: 'replace', path: '/isCritical', value: isCritical }])
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                fetchPatientData(patientId);
            } catch (error) {
                console.error('Error updating critical status:', error);
                alert('Došlo je do greške prilikom ažuriranja statusa.');
            }
        });
    }


}

function setupDeleteButton(patientId) {
    const deleteButton = document.getElementById('deletePatientButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            const confirmation = confirm('Da li ste sigurni da želite izbrisati pacijenta?');
            if (confirmation) {
                try {
                    const response = await fetch(`${urlPatient}/${patientId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    window.location.href = '../view/patients.html'
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

    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    medicalData.patientId = patientId;

    console.log('Medical Data to be sent:', medicalData);

    try {
        const response = await fetch(`${urlRecord}/${patientId}`, {
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

function setupRtgUpload(patientId) {
    const uploadButton = document.getElementById('uploadRtgButton');
    const fileInput = document.getElementById('rtgFileInput');

    if (uploadButton && fileInput) {
        uploadButton.addEventListener('click', () => {
            try {
                fileInput.click();
            } catch (error) {
                console.error('Error opening file input:', error);
            }
        });

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('patientId', patientId);

                try {
                    const response = await fetch(`${urlPatient}/uploadRtg`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const result = await response.json();
                    const rtgImage = document.getElementById('rtgImage');
                    if (rtgImage) {
                        rtgImage.src = result.imageUrl;
                    }
                    alert('RTG snimak uspješno uploadovan.');
                } catch (error) {
                    console.error('Error uploading RTG image:', error);
                    alert('Došlo je do greške prilikom uploadovanja RTG snimka.');
                }
            }
        });
    } else {
        console.error('Upload button or file input not found');
    }
}


