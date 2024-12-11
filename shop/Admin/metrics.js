const API_URL = 'http://localhost:3000/shop-metrics';

document.getElementById('filter-button').addEventListener('click', fetchFilteredMetrics);

let chartInstance; // Declare a global variable to hold the chart instance

async function fetchFilteredMetrics() {
    const userId = document.getElementById('user-id').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    const params = new URLSearchParams({ userId, startDate, endDate }).toString();
    const url = `${API_URL}?${params}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            displayMetricsChart(data.metrics);
        } else {
            console.error('Failed to fetch shop metrics:', data.error);
        }
    } catch (error) {
        console.error('Error fetching shop metrics:', error);
    }
}

function displayMetricsChart(metrics) {
    const ctx = document.getElementById('metrics-chart').getContext('2d');

    // Destroy the existing chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance and store it in the global variable
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Transactions', 'Total Amount', 'Total Items Sold'],
            datasets: [{
                label: 'Metrics',
                data: [metrics.totalTransactions, metrics.totalAmount, metrics.totalItemsSold],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
