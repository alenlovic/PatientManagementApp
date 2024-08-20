
const urlBilling = "https://localhost:44376/api/billing";

const billingList = document.getElementById("billingList");

async function fetchAllBillingData() {
    try {
        const response = await fetch(urlBilling);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const billingData = await response.json();
        displayBillingData(billingData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function displayBillingData(billingData) {
    billingList.innerHTML = ''; 

    billingData.forEach(billing => {
        const row = document.createElement('tr');

        const patientName = billing.patient ? `${billing.patient.firstName} ${billing.patient.lastName}` : 'N/A';
        const paymentMethod = billing.paymentMethod || 'N/A';
        const currentAmount = billing.currentAmount || 'N/A';
        const dateOfLastPayment = billing.dateOfLastPayment ? new Date(billing.dateOfLastPayment).toLocaleDateString() : 'N/A';
        const remainingAmount = billing.remainingAmount || 'N/A';
        const billingStatus = billing.billingStatus || 'N/A';


        row.innerHTML = `
            <td>${patientName}</td>
            <td>${paymentMethod}</td>
            <td>${currentAmount}</td>
            <td>${dateOfLastPayment}</td>
            <td>${remainingAmount}</td>
            <td>${billingStatus}</td>
        `;

        billingList.appendChild(row);
    });
}

fetchAllBillingData();
