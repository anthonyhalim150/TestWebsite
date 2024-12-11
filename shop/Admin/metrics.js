const API_URL = 'http://localhost:3000/shop-metrics'
async function fetchShopMetrics() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success) {
            document.getElementById('total-sales').textContent = data.totalSales;
            document.getElementById('total-items-sold').textContent = data.totalItemsSold;
            document.getElementById('total-products-in-stock').textContent = data.totalProductsInStock;
        } else {
            console.error('Failed to fetch shop metrics:', data.error);
        }
    } catch (error) {
        console.error('Error fetching shop metrics:', error);
    }
}
fetchShopMetrics();