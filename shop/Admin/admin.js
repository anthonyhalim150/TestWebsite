function crawler_check(){
    const userRole = localStorage.getItem('role'); 
    if (window.location.pathname.includes('/shop/admin') && (userRole !== 'admin' || get_user_role()!== 'admin')) {
        console.log('tes');
        window.location.href = '../index.html';  // Redirect to non-admins to homepage
    }
}

function get_user_role() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        return payload.role;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
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
            <h2>Admin Dashboard</h2>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li class="dropdown">
                    <a href="#" class="nav-item dropdown-toggle">
                        Products <span class="arrow">▼</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="add_new_product.html" class="nav-item">Add Product</a></li>
                        <li><a href="product_list.html" class="nav-item">Product List</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="nav-item dropdown-toggle">
                        Auctions <span class="arrow">▼</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="add_new_auction.html" class="nav-item">Add Auction</a></li>
                        <li><a href="auction_list.html" class="nav-item">Auction List</a></li>
                        <li class="dropdown nested-dropdown">
                            <a href="#" class="nav-item dropdown-toggle">
                                Auction Status <span class="arrow">▶</span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="expired_auction_list.html" class="nav-item">Expired Auctions</a></li>
                                <li><a href="ongoing_auction_list.html" class="nav-item">Ongoing Auctions</a></li>
                                <li><a href="upcoming_auction_list.html" class="nav-item">Upcoming Auctions</a></li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="nav-user dropdown-toggle">
                        Users <span class="arrow">▼</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="add_new_user.html" class="nav-user">Add Users</a></li>               
                        <li><a href="user_list.html" class="nav-user">User List</a></li>
                    </ul>
                </li>
                <li><a href="transaction_list.html" class="nav-item">Transaction List</a></li>
                <li><a href="metrics.html" class="nav-item">Metrics</a></li>
                <li><a href="comment_list.html" class="nav-item">Comments</a></li>
                <li><a href="./AI/templates/AI_comment.html" class="nav-item">AI Page</a></li>
                <li><a id="logout_nav" class="nav-item">Logout</a></li>
            </ul>
        </nav>
    `;

    // Append sidebar to the body or a specific container
    document.body.prepend(sidebar);

    // Add event listeners for dropdown
    open_drop_down();
}

function clear_login() {
    const login = document.getElementById('logout_nav');
    login.addEventListener('click', () => {
        // Clear user info and refresh the page
        localStorage.clear();
        alert('You have logged out.');
        window.location.href = '../login.html';
    });
}

function open_drop_down() {
    // Select all dropdown toggles
    const drop_down_toggles = document.querySelectorAll('.dropdown-toggle');

    drop_down_toggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();

            // Toggle the 'open' class for the parent dropdown
            const dropdown = toggle.parentElement;

            // Check if it is a nested dropdown
            const isNested = dropdown.classList.contains('nested-dropdown');

            // Toggle only the clicked dropdown
            dropdown.classList.toggle('open');

            // Close other dropdowns at the same level
            const siblingDropdowns = isNested
                ? dropdown.parentElement.querySelectorAll('.nested-dropdown')
                : dropdown.parentElement.querySelectorAll('.dropdown');

            siblingDropdowns.forEach(sibling => {
                if (sibling !== dropdown) {
                    sibling.classList.remove('open');
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
    clear_login();
});
