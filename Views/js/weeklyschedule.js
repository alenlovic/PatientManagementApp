document.addEventListener("DOMContentLoaded", function () {
    fetchAndDisplayAppointments();
});

async function addNewAppointment() {
    const personalName = document.getElementById('personalName').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentNote = document.getElementById('appointmentNote').value;

    const newAppointment = {
        personalName: personalName,
        appointmentDate: appointmentDate,
        appointmentNote: appointmentNote
    };

    try {
        const response = await fetch('https://localhost:44376/api/patientappointment/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newApp)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error creating appointment: ${JSON.stringify(errorData)}`);
        }

        console.log('Appointment created successfully');
    } catch (error) {
        console.error(error);
    }
}

function updatePatientPersonalName(patientId, personalName) {
    fetch(`https://localhost:44376/api/patient/${patientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(patient => {
            patient.patientPersonalName = personalName;
            return fetch(`https://localhost:44376/api/patient/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patient)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Patient personal name updated successfully');
        })
        .catch(error => {
            console.error('Error updating patient personal name:', error);
        });
}

function closeModal() {
    const modal = document.getElementById('appointmentModal');
    modal.style.display = 'none';
}

function getStartOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);

    if (dayOfWeek !== 1) {
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    }
    return startOfWeek;
}

function getCurrentWeekIdentifier() {
    const startOfWeek = getStartOfWeek();
    const year = startOfWeek.getFullYear();
    const weekNumber = Math.ceil((((startOfWeek - new Date(startOfWeek.getFullYear(), 0, 1)) / 86400000) + startOfWeek.getDay() + 1) / 7);
    return `${year}-W${weekNumber}`;
}

function markAsPresent(patientBox, patientId, patientAppointmentId) {
    if (!patientId || !patientAppointmentId) {
        console.error("Invalid patientId or patientAppointmentId:", patientId, patientAppointmentId);
        return;
    }
    console.log(`Marking patient ${patientId} as present`);
    patientBox.style.backgroundColor = "lightgreen";
    savePresence(patientId, patientAppointmentId);
}

function savePresence(patientId, patientAppointmentId) {
    if (!patientId || !patientAppointmentId) {
        console.error("Invalid patientId or patientAppointmentId:", patientId, patientAppointmentId);
        return;
    }
    const weekIdentifier = getCurrentWeekIdentifier();
    let presentPatients = [];
    try {
        presentPatients = JSON.parse(localStorage.getItem(weekIdentifier)) || [];
    } catch (e) {
        console.error("Error parsing localStorage data:", e);
    }
    if (!presentPatients.includes(patientAppointmentId)) {
        presentPatients.push(patientAppointmentId);
    }
    localStorage.setItem(weekIdentifier, JSON.stringify(presentPatients));
    console.log(`Saved presence for patient ${patientId} with appointment ${patientAppointmentId} in week ${weekIdentifier}`);
}

function loadPresence() {
    const weekIdentifier = getCurrentWeekIdentifier();
    let presentPatients = [];
    try {
        presentPatients = JSON.parse(localStorage.getItem(weekIdentifier)) || [];
    } catch (e) {
        console.error("Error parsing localStorage data:", e);
    }
    console.log(`Loaded presence for week ${weekIdentifier}:`, presentPatients);
    return presentPatients;
}

function fetchAppointmentsForDate(date) {
    const formattedDate = date.toISOString().split('T')[0];
    console.log(`Fetching appointments for ${formattedDate}`);

    return fetch(`https://localhost:44376/api/patientappointment/appointments?date=${formattedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Fetched data for ${formattedDate}:`, data);
            return { date: formattedDate, appointments: data };
        })
        .catch(error => {
            console.error(`Error fetching appointments for ${formattedDate}:`, error);
            return { date: formattedDate, appointments: [] };
        });
}


function fetchAndDisplayAppointments() {
    const startOfWeek = getStartOfWeek();
    const fetchPromises = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        fetchPromises.push(fetchAppointmentsForDate(date));
    }

    Promise.all(fetchPromises).then(results => {
        const wscheduleList = document.getElementById("wscheduleList");
        wscheduleList.innerHTML = "";

        const presentPatients = loadPresence();
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        results.forEach((result, index) => {
            const dayCell = document.createElement("td");
            result.appointments.forEach(appointment => {
                console.log("Appointment object:", appointment); // Log the appointment object

                const appointmentDate = moment(appointment.appointmentDate);
                const formattedDate = appointmentDate.format('DD.MM.YYYY HH:mm');
                const patientBox = document.createElement("div");
                patientBox.className = "patient-box";
                const nameStyle = appointment.patient && appointment.patient.isCritical ? 'style="color: red;"' : '';
                patientBox.innerHTML = `
                    <span class="appointment-date">${formattedDate}</span>
                    <span class="patient-name" ${nameStyle}>${appointment.patientPersonalName || 'Nije pronađeno ime pacijenta'}</span>
                    <span class="service">${appointment.appointmentNote || ''}</span>
                    <button class="mark-present-btn" data-appointment-id="${appointment.patientAppointmentId}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="edit-appointment-btn" data-appointment-id="${appointment.patientAppointmentId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-appointment-btn" data-appointment-id="${appointment.patientAppointmentId}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                if (presentPatients.includes(appointment.patientAppointmentId)) {
                    patientBox.style.backgroundColor = "lightgreen";
                }
                dayCell.appendChild(patientBox);

                const markPresentBtn = patientBox.querySelector(".mark-present-btn");
                if (markPresentBtn) {
                    markPresentBtn.addEventListener("click", () => {
                        const patientId = appointment.patientId;
                        const patientAppointmentId = appointment.patientAppointmentId;
                        markAsPresent(patientBox, patientId, patientAppointmentId);
                    });
                } else {
                    console.error("Element with class 'mark-present-btn' not found.");
                }

                const editAppointmentBtn = patientBox.querySelector(".edit-appointment-btn");
                editAppointmentBtn.addEventListener("click", () => {
                    const patientAppointmentId = appointment.patientAppointmentId;
                    console.log("Edit button clicked, patientAppointmentId:", patientAppointmentId); // Debugging log
                    openEditPopup(patientAppointmentId);
                });

                const deleteAppointmentBtn = patientBox.querySelector(".delete-appointment-btn");
                deleteAppointmentBtn.addEventListener("click", () => {
                    const patientAppointmentId = appointment.patientAppointmentId;
                    deleteAppointment(patientAppointmentId);
                });
            });
            wscheduleList.appendChild(dayCell);
        });
    });
}


function openEditPopup(patientAppointmentId) {
    if (!patientAppointmentId) {
        console.error("Invalid appointmentId:", patientAppointmentId);
        return;
    }
    fetch(`https://localhost:44376/api/patientappointment/appointments/${patientAppointmentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate the edit form with the fetched data
            document.getElementById('editPersonalName').value = data.patient.personalName;
            document.getElementById('editAppointmentDate').value = new Date(data.appointmentDate).toISOString().slice(0, 16);
            document.getElementById('editAppointmentNote').value = data.appointmentNote;

            // Open the edit popup
            const editModal = document.getElementById('editAppointmentModal');
            editModal.style.display = 'block';
        })
        .catch(error => {
            console.error(`Error fetching appointment details:`, error);
        });
}

async function deleteAppointment(appointmentId) {
    try {
        const response = await fetch(`https://localhost:44376/api/patientappointment/appointments/${appointmentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        console.log('Appointment deleted successfully');
        // Refresh the appointments list after deletion
        fetchAndDisplayAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}


