const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app/shop-metrics';

document.getElementById('filter-button').addEventListener('click', fetchFilteredMetrics);

let salesChart, productMetricsChart, productComparisonChart, userRegistrationChart; // Chart instances

async function fetchFilteredMetrics() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    const params = new URLSearchParams({ startDate, endDate }).toString();
    const url = `${API_URL}?${params}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            displaySalesOverTimeChart(data.salesOverTime);
            displayProductMetricsChart(data.productMetricsOverTime);
            displayProductComparisonChart(data.productComparison);
            displayUserRegistrationChart(data.userRegistrations);
        } else {
            console.error('Failed to fetch shop metrics:', data.error);
        }
    } catch (error) {
        console.error('Error fetching shop metrics:', error);
    }
}

function displaySalesOverTimeChart(salesData) {
    if (!salesData || !salesData.timeLabels) {
        console.error("Missing sales data");
        return;
    }

    const ctx = document.getElementById('sales-chart').getContext('2d');

    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesData.timeLabels,
            datasets: [
                {
                    label: 'Total Amount',
                    data: salesData.totalAmounts || [],
                    borderColor: '#33FF57',
                    fill: false,
                },
            ],
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { beginAtZero: true },
            },
        },
    });
}

function displayProductMetricsChart(productMetrics) {
    const ctx = document.getElementById('product-metrics-chart').getContext('2d');

    if (productMetricsChart) {
        productMetricsChart.destroy();
    }

    productMetricsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: productMetrics.timeLabels,
            datasets: [
                {
                    label: 'Total Items Sold',
                    data: productMetrics.itemsSold,
                    borderColor: '#3357FF',
                    fill: false,
                },
                {
                    label: 'Stock Remaining',
                    data: productMetrics.stockRemaining,
                    borderColor: '#FF33FF',
                    fill: false,
                },
            ],
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { beginAtZero: true },
            },
        },
    });
}

function displayProductComparisonChart(productComparison) {
    const ctx = document.getElementById('product-comparison-chart').getContext('2d');

    if (productComparisonChart) {
        productComparisonChart.destroy();
    }

    productComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productComparison.productNames,
            datasets: [
                {
                    label: 'Total Items Sold',
                    data: productComparison.itemsSold,
                    backgroundColor: '#FF5733',
                },
            ],
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Products' } },
                y: { beginAtZero: true },
            },
        },
    });
}

function displayUserRegistrationChart(userRegistrations) {
    if (!userRegistrations || !userRegistrations.timeLabels) {
        console.error("Missing user registration data");
        return;
    }

    const ctx = document.getElementById('user-registration-chart').getContext('2d');

    if (userRegistrationChart) {
        userRegistrationChart.destroy();
    }

    userRegistrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: userRegistrations.timeLabels,
            datasets: [
                {
                    label: 'New Users',
                    data: userRegistrations.newUsers || [],
                    borderColor: '#FF5733',
                    fill: false,
                },
            ],
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { beginAtZero: true },
            },
        },
    });
}
