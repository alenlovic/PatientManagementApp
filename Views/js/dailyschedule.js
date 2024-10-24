document.addEventListener("DOMContentLoaded", function () {
    // Function to fetch and display appointments for today
    function fetchAndDisplayAppointments() {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        console.log(`Fetching appointments for date: ${today}`); // Log the date being fetched

        fetch(`https://localhost:44376/api/patientappointment/appointments?date=${today}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data); // Log the fetched data
                const dscheduleList = document.getElementById("dscheduleList");
                dscheduleList.innerHTML = ""; // Clear existing rows

                if (data.length === 0) {
                    console.log('No appointments found for today.');
                }

                data.forEach(appointment => {
                    const row = document.createElement("tr");

                    const timeCell = document.createElement("td");
                    const appointmentDate = moment(appointment.appointmentDate);
                    if (!appointmentDate.isValid()) {
                        console.error('Invalid date format:', appointment.AppointmentDate);
                        timeCell.textContent = 'Invalid Date';
                    } else {
                        const formattedDate = appointmentDate.format('DD.MM.YYYY HH:mm');
                        timeCell.innerHTML = `<span class="time">${formattedDate}</span>`;
                    }
                    row.appendChild(timeCell);

                    const nameCell = document.createElement("td");
                    const nameStyle = appointment.isCritical ? 'style="color: red;"' : '';
                    nameCell.innerHTML = `<span class="patient-name" ${nameStyle}>${appointment.patientName || 'undefined'}</span>`;
                    row.appendChild(nameCell);

                    const serviceCell = document.createElement("td");
                    serviceCell.innerHTML = `<span class="service">${appointment.appointmentNote || 'undefined'}</span>`;
                    row.appendChild(serviceCell);

                    dscheduleList.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching appointments:', error));
    }

    // Initial fetch and display of appointments
    fetchAndDisplayAppointments();

    // Set up a timer to refresh data every midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const timeUntilNextMidnight = nextMidnight - now;
    setTimeout(() => {
        fetchAndDisplayAppointments();
        setInterval(fetchAndDisplayAppointments, 24 * 60 * 60 * 1000); // Refresh every 24 hours
    }, timeUntilNextMidnight);
});
