document.addEventListener("DOMContentLoaded", function () {
    const monthPicker = document.getElementById('monthPicker');
    if (monthPicker) {
        monthPicker.addEventListener('change', function () {
            fetchAndDisplayAppointments(monthPicker.value);
        });
        fetchAndDisplayAppointments(monthPicker.value);
    }
});

async function fetchAndDisplayAppointments(selectedMonth) {
    const startDate = new Date(selectedMonth + "-01");
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    try {
        const response = await fetch(`https://localhost:44376/api/patientappointment/appointmentsmonthly?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const appointments = await response.json();
        displayAppointments(appointments, startDate, endDate);
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

function displayAppointments(appointments, startDate, endDate) {
    const appointmentsTableBody = document.querySelector('.appointments-table');
    if (!appointmentsTableBody) {
        console.error('Appointments table body not found');
        return;
    }

    appointmentsTableBody.innerHTML = '';

    const daysInMonth = endDate.getDate();
    const appointmentsByDate = {};

    for (let i = 1; i <= daysInMonth; i++) {
        appointmentsByDate[i] = [];
    }

    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate).getDate();
        appointmentsByDate[appointmentDate].push(appointment);
    });

    let currentRow = document.createElement('tr');
    let dayOfWeek = new Date(startDate.getFullYear(), startDate.getMonth(), 1).getDay();

    // Dodaj prazne ćelije za dane pre početka meseca
    for (let i = 1; i < dayOfWeek; i++) {
        if (i >= 1 && i <= 5) {
            const emptyCell = document.createElement('td');
            currentRow.appendChild(emptyCell);
        }
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), i);
        dayOfWeek = date.getDay();

        if (dayOfWeek === 1 && currentRow.children.length > 0) {
            appointmentsTableBody.appendChild(currentRow);
            currentRow = document.createElement('tr');
        }

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const cell = document.createElement('td');
            const dateCell = document.createElement('div');
            dateCell.textContent = i;
            cell.appendChild(dateCell);

            if (appointmentsByDate[i].length === 0) {
                const noAppointmentsBox = document.createElement('div');
                noAppointmentsBox.className = 'patient-box';
                noAppointmentsBox.textContent = 'Nema zakazanih termina';
                cell.appendChild(noAppointmentsBox);
            } else {
                appointmentsByDate[i].forEach(appointment => {
                    const patientBox = document.createElement('div');
                    patientBox.className = 'patient-box';
                    const nameStyle = appointment.patient && appointment.patient.isCritical ? 'style="color: red;"' : '';
                    const appointmentTime = new Date(appointment.appointmentDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    patientBox.innerHTML = `
                        <span class="patient-name" ${nameStyle}>${appointment.patientPersonalName || 'Nije pronađeno ime pacijenta'}</span>
                        <span class="appointment-date">${appointmentTime}</span>
                    `;
                    cell.appendChild(patientBox);
                });
            }

            currentRow.appendChild(cell);
        }

        if (dayOfWeek === 5) {
            appointmentsTableBody.appendChild(currentRow);
            currentRow = document.createElement('tr');
        }
    }

    // Dodaj prazne ćelije za dane koji prelaze u drugi mesec, ali samo do kraja meseca
    if (currentRow.children.length > 0 && currentRow.children.length < 5) {
        appointmentsTableBody.appendChild(currentRow);
    }
}
