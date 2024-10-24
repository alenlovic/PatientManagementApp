document.addEventListener("DOMContentLoaded", function () {
    // Function to calculate the start date for the current week (Monday)
    function getStartOfWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);

        // Adjust to the previous Monday if today is not Monday
        if (dayOfWeek !== 1) {
            startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        }
        return startOfWeek;
    }

    // Function to fetch appointments for a specific date
    function fetchAppointmentsForDate(date) {
        const formattedDate = date.toISOString().split('T')[0];
        console.log(`Fetching appointments for ${formattedDate}`); // Log the date being fetched

        return fetch(`https://localhost:44376/api/patientappointment/appointments?date=${formattedDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Fetched data for ${formattedDate}:`, data); // Log the fetched data
                return { date: formattedDate, appointments: data };
            })
            .catch(error => {
                console.error(`Error fetching appointments for ${formattedDate}:`, error);
                return { date: formattedDate, appointments: [] };
            });
    }

    // Function to fetch and display appointments for the current week
    function fetchAndDisplayAppointments() {
        const startOfWeek = getStartOfWeek();

        // Fetch appointments for each day from Monday to Friday
        const fetchPromises = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            fetchPromises.push(fetchAppointmentsForDate(date));
        }

        // Process all fetched data
        Promise.all(fetchPromises).then(results => {
            const wscheduleList = document.getElementById("wscheduleList");
            wscheduleList.innerHTML = ""; // Clear existing rows

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
                        <span class="patient-name" ${nameStyle}>${appointment.patientName || 'undefined'}</span>
                        <span class="service">${appointment.appointmentNote || 'undefined'}</span>
                    `;
                    dayCell.appendChild(patientBox);
                });
                wscheduleList.appendChild(dayCell);
            });
        });
    }

    // Initial fetch and display of appointments
    fetchAndDisplayAppointments();

    // Set up a timer to refresh data every Monday at 00:00
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
    nextMonday.setHours(0, 0, 0, 0);

    const timeUntilNextMonday = nextMonday - now;
    setTimeout(() => {
        fetchAndDisplayAppointments();
        setInterval(fetchAndDisplayAppointments, 7 * 24 * 60 * 60 * 1000); // Refresh every week
    }, timeUntilNextMonday);
});
