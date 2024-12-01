﻿const urlPatient = 'https://localhost:44376/api/patient';
const urlBilling = 'https://localhost:44376/api/billing';
const urlRecord = `https://localhost:44376/api/patientrecord`;
const urlFiles = `https://localhost:44376/api/patientfile`;

function getPatientId() {
    const editPatientForm = document.getElementById('editPatientForm');
    return editPatientForm.dataset.patientid;
}

document.addEventListener('DOMContentLoaded', () => {
    const patientId = getPatientId();

    if (patientId) {
        fetchPatientData(patientId);
        displayPatientFiles(patientId);
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

    if (!form) {
        console.error('Form not found');
        return;
    }

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


function closeEditPopup() {
    const modal = document.getElementById("editModal");
    modal.style.display = "none";
}

async function savePatientData() {
    const form = document.getElementById('editPatientForm');
    const formData = new FormData(form);
    const patientData = {};
    formData.forEach((value, key) => {
        patientData[key] = value;
    });

    patientData.patientId = getPatientId();

    // Extract firstName, lastName, and fathersName from fullName
    //const fullName = form.fullName.value;
    //const fullNameParts = fullName.split(' ');
    //patientData.firstName = fullNameParts[0];
    //patientData.lastName = fullNameParts[fullNameParts.length - 1];
    //patientData.fathersName = fullNameParts.slice(1, -1).join(' ');

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
        closeEditPopup();
    } catch (error) {
        console.error('Error saving patient data:', error);
        alert('Došlo je do greške prilikom čuvanja podataka.');
    }
}

async function fetchPatientData(patientId) {
    try {
        const billingUrl = `${urlBilling}?patientId=${patientId}`;
        const recordUrl = `${urlRecord}/ByPatientId/${patientId}`;
        const fileUrl = `${urlFiles}?patientId=${patientId}`

        console.log('Fetching Billing Data from:', billingUrl);
        console.log('Fetching Record Data from:', recordUrl);
        console.log('Fetching files from:', fileUrl)

        const [patientResponse, billingResponse, recordResponse, filesResponse] = await Promise.all([
            fetch(`${urlPatient}/${patientId}`),
            fetch(billingUrl),
            fetch(recordUrl),
            fetch(fileUrl)
        ]);

        if (!patientResponse.ok || !billingResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const [patient, billing, record, files] = await Promise.all([
            patientResponse.json(),
            billingResponse.json(),
            recordResponse.json(),
            filesResponse.json()
        ]);

        console.log('Patient Data:', patient);
        console.log('Billing Data:', billing);
        console.log('Record Data:', record);
        console.log('Files data:', files)

        if (record.length === 0) {
            console.warn('No record data found for patient:', patientId);
        }

        const combinedData = combineData(patient, billing, record, files);
        console.log('Combined Data:', combinedData);

        populatePatientInfo(combinedData, patientId);
        displayPatientFiles(files);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function deletePatientFile(fileId, patientId) {
    try {
        console.log(`Attempting to delete file with ID: ${fileId}`);
        const response = await fetch(`https://localhost:44376/api/patientfile/${fileId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Refresh the patient files
        displayPatientFiles(patientId);
    } catch (error) {
        console.error('Error deleting patient file:', error);
        alert('Došlo je do greške prilikom brisanja fajla.');
    }
}

async function displayPatientFiles(patientId) {
    const filesContainer = document.getElementById('patient-files-container');
    if (!filesContainer) {
        console.error('Files container not found');
        return;
    }

    try {
        const response = await fetch(`https://localhost:44376/api/patientfile?patientId=${patientId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const files = await response.json();
        console.log('Fetched files:', files);

        filesContainer.innerHTML = ''; // Očisti prethodni sadržaj

        files.forEach(file => {
            console.log('Individual file object:', file); // Log strukture fajla

            // Div za svaki fajl
            const fileElement = document.createElement('div');
            fileElement.classList.add('file-item');

            // Prikaz originalnog imena fajla
            if (file.fileOriginalName) {
                const fileNameElement = document.createElement('div');
                fileNameElement.textContent = `${file.fileOriginalName}`;
                fileElement.appendChild(fileNameElement);
            }

            // Action icons container
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('file-actions');

            // Preview icon
            const previewIcon = document.createElement('i');
            previewIcon.classList.add('fas', 'fa-eye', 'action-icon');
            previewIcon.title = 'Preview';
            actionsContainer.appendChild(previewIcon);

            // Download icon
            const downloadIcon = document.createElement('a');
            downloadIcon.href = `data:image/jpeg;base64,${file.imageBase64}`;
            downloadIcon.download = file.fileOriginalName;
            downloadIcon.classList.add('fas', 'fa-download', 'action-icon');
            downloadIcon.title = 'Download';
            actionsContainer.appendChild(downloadIcon);

            // Delete icon
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash', 'action-icon');
            deleteIcon.title = 'Delete';
            deleteIcon.addEventListener('click', () => {
                const confirmation = confirm('Da li ste sigurni da želite izbrisati ovaj fajl?');
                if (confirmation) {
                    deletePatientFile(file.fileId, patientId);
                }
            });
            actionsContainer.appendChild(deleteIcon);

            fileElement.appendChild(actionsContainer);
            filesContainer.appendChild(fileElement);
        });
    } catch (error) {
        console.error('Došlo je do greške prilikom dohvatanja fajlova:', error);
    }
}

function combineData(patient, billing, record, files) {
    console.log('Combining data:', { patient, billing, record, files });
    const patientBilling = billing.length > 0 ? billing[0] : {};
    const patientRecord = record;
    const patientFiles = files.length > 0 ? files[0] : {};
    return { ...patient, ...patientBilling, ...patientRecord, ...patientFiles };
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
    `;

    if (combinedData.serviceCost > 0) {
        const paymentDiv = document.createElement('div');
        paymentDiv.classList.add('personal-info-patient');
        paymentDiv.innerHTML = `
            <h4>Detalji o plaćanju</h4>
            <hr>
            <div class="info-row">
                <span class="info-label">Naziv usluge:</span>
                <span class="info-value">${combinedData.serviceName || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cijena usluge:</span>
                <span class="info-value">${combinedData.serviceCost || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Način plaćanja:</span>
                <span class="info-value">${combinedData.paymentMethod || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Uplaćeno:</span>
                <span class="info-value">${combinedData.payedAmount || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Datum zadnje uplate:</span>
                <span class="info-value">${new Date(combinedData.dateOfLastPayment).toLocaleDateString() || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Preostali iznos:</span>
                <span class="info-value">${combinedData.remainingAmount || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Detalji:</span>
                <span class="info-value">${combinedData.billingNote || 'N/A'}</span>
            </div>
        `;
        patientDiv.appendChild(paymentDiv);
    }

    if (combinedData.fileName) {
        const filesDiv = document.createElement('div');
        filesDiv.classList.add('personal-info-patient');
        filesDiv.innerHTML = `
        <h4>RTG snimci</h4>
        <hr>
        <i id="uploadRtgButton" class="fas fa-plus add-icon" title="Dodaj RTG snimak"></i>
        <input type="file" id="rtgFileInput" style="display: none;" accept="image/*">
        <div class="info-row" id="patient-files-container">
            <img id="rtgImage" src="" alt="RTG snimak" style="display: none; max-width: 100%;">
        </div>
            
        </div>
    `;
        patientDiv.appendChild(filesDiv);
    }

    patientProfileContainer.appendChild(patientDiv);

    setupDeleteButton(patientId);
    setupEditButton(patientId, combinedData);
    setupRtgUpload(patientId);

    // Add event listener for the critical checkbox
    const criticalCheckbox = document.getElementById('isCriticalCheckbox');
    if (criticalCheckbox) {
        criticalCheckbox.addEventListener('change', async () => {
            try {
                const isCritical = criticalCheckbox.checked;
                const patientId = getPatientId();

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

                    window.location.href = '/Patients';
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

function closeEditMedicalPopup(patient) {
    const modal = document.getElementById("editMedicalModal");
    // Show the modal
    modal.style.display = "none";
}

async function saveMedicalData() {
    const form = document.getElementById('editMedicalForm');
    const formData = new FormData(form);
    const medicalData = {};
    formData.forEach((value, key) => {
        medicalData[key] = value;
    });

    medicalData.patientId = getPatientId();

    console.log('Medical Data to be sent:', medicalData);

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
        closeEditMedicalPopup();
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
                // Check file size (example: limit to 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('File size exceeds the 5MB limit.');
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('patientId', patientId);

                try {
                    const response = await fetch(`https://localhost:44376/api/patientfile/uploadRtg`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Network response was not ok: ${errorText}`);
                    }

                    const result = await response.json();
                    const rtgImage = document.getElementById('rtgImage');
                    if (rtgImage) {
                        rtgImage.src = `data:image/jpeg;base64,${result.imageBase64}`;
                        rtgImage.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error uploading RTG image', error);
                }
            }
        });
    }
}