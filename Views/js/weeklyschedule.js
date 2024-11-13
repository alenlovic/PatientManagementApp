document.addEventListener("DOMContentLoaded", function () {
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

    function markAsPresent(patientBox, patientId) {
        if (!patientId) {
            console.error("Invalid patientId:", patientId);
            return;
        }
        console.log(`Marking patient ${patientId} as present`);
        patientBox.style.backgroundColor = "lightgreen";
        savePresence(patientId);
    }

    function savePresence(patientId) {
        if (!patientId) {
            console.error("Invalid patientId:", patientId);
            return;
        }
        const weekIdentifier = getCurrentWeekIdentifier();
        let presentPatients = [];
        try {
            presentPatients = JSON.parse(localStorage.getItem(weekIdentifier)) || [];
        } catch (e) {
            console.error("Error parsing localStorage data:", e);
        }
        if (!presentPatients.includes(patientId)) {
            presentPatients.push(patientId);
        }
        localStorage.setItem(weekIdentifier, JSON.stringify(presentPatients));
        console.log(`Saved presence for patient ${patientId} in week ${weekIdentifier}`);
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
                    const appointmentDate = moment(appointment.appointmentDate);
                    const formattedDate = appointmentDate.format('DD.MM.YYYY HH:mm');
                    const patientBox = document.createElement("div");
                    patientBox.className = "patient-box";
                    const nameStyle = appointment.isCritical ? 'style="color: red;"' : '';
                    patientBox.innerHTML = `
                        <span class="appointment-date">${formattedDate}</span>
                        <span class="patient-name" ${nameStyle}>${appointment.patientName || 'N/A'}</span>
                        <span class="service">${appointment.appointmentNote || 'N/A'}</span>
                        <button class="mark-present-btn" data-patient-id="${appointment.patientId}">
                            <i class="fas fa-check"></i>
                        </button>
                    `;
                    if (presentPatients.includes(appointment.patientId)) {
                        patientBox.style.backgroundColor = "green";
                    }
                    dayCell.appendChild(patientBox);

                    const markPresentBtn = patientBox.querySelector(".mark-present-btn");
                    markPresentBtn.addEventListener("click", () => {
                        const patientId = markPresentBtn.getAttribute("data-patient-id");
                        markAsPresent(patientBox, patientId);
                    });
                });
                wscheduleList.appendChild(dayCell);
            });
        });
    }

    fetchAndDisplayAppointments();

    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
    nextMonday.setHours(0, 0, 0, 0);

    const timeUntilNextMonday = nextMonday - now;
    setTimeout(() => {
        fetchAndDisplayAppointments();
        setInterval(fetchAndDisplayAppointments, 7 * 24 * 60 * 60 * 1000);
    }, timeUntilNextMonday);
});
