function crawler_check(){
    const userRole = localStorage.getItem('role'); 
    if (window.location.pathname.includes('/shop/admin') && (userRole !== 'admin' || get_user_role()!== 'admin')) {
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
                <li><a href="metrics.html" class="nav-item">Metrics</a></li>
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

function open_drop_down(){
    const drop_down_toggle = document.querySelector('.dropdown-toggle');
    const drop_down = document.querySelector('.dropdown');

    drop_down_toggle.addEventListener('click', (event) => {
        event.preventDefault();
        drop_down.classList.toggle('open');
    });
}


document.addEventListener('DOMContentLoaded', () => {
    createSidebar();
    crawler_check();
    clear_login();
});
