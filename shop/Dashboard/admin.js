async function crawler_check(){
    const userRole = await get_user_role(); 
    if (window.location.pathname.includes('/shop/Dashboard') && userRole !== 'user') {
        window.location.href = sanitizeURL('/shop/login.html');  // Redirect to non-admins to homepage
    }
}




// Function to create the sidebar
function createSidebar() {
    // Sidebar container
    const sidebar = document.createElement('aside');
    sidebar.classList.add('sidebar');

    // Sidebar content
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <h2>Dashboard</h2>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li><a href="/shop/Dashboard/wallet.html" class="nav-item">Wallet</a></li>
                <li class="dropdown">
                    <a href="#" class="nav-item dropdown-toggle">
                        Products <span class="arrow">▼</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/shop/Dashboard/add_new_product.html" class="nav-item">Add Product</a></li>
                        <li><a href="/shop/Dashboard/product_list.html" class="nav-item">Product List</a></li>
                        <li><a href="/shop/Dashboard/transaction_list.html" class="nav-item">Sold List</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="nav-item dropdown-toggle">
                        Auctions <span class="arrow">▼</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/shop/Dashboard/add_new_auction.html" class="nav-item">Add Auction</a></li>
                        <li><a href="/shop/Dashboard/expired_auction_list.html" class="nav-item">Expired Auction List</a></li>
                        <li><a href="/shop/Dashboard/ongoing_auction_list.html" class="nav-item">Ongoing Auction List</a></li>
                        <li><a href="/shop/Dashboard/upcoming_auction_list.html" class="nav-item">Upcoming Auction List</a></li>
                    </ul>
                </li>
                <li><a href="/shop/Dashboard/transaction_history.html" class="nav-item">Transaction List</a></li>
                <li><a href="/shop/Dashboard/metrics.html" class="nav-item">Metrics</a></li>
                <li><a href="/shop/index.html" class="nav-item">Home</a></li>
            </ul>
        </nav>
    `;

    // Append sidebar to the body or a specific container
    document.body.prepend(sidebar);
    sanitizeAllLinks();

    // Add event listeners for dropdown
    open_drop_down();
}



function open_drop_down() {
    // Select all dropdown toggles
    const drop_down_toggles = document.querySelectorAll('.dropdown-toggle');

    drop_down_toggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();

            // Find the parent dropdown and toggle the 'open' class
            const dropdown = toggle.parentElement;
            dropdown.classList.toggle('open');

            // Close other open dropdowns
            document.querySelectorAll('.dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('open');
                }
            });
        });
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', (event) => {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
}



document.addEventListener('DOMContentLoaded', () => {
    createSidebar();
    crawler_check();
});
