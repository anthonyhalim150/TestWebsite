function crawler_check(){
    const userRole = localStorage.getItem('role'); 
    console.log(window.location.pathname);
    if (window.location.pathname === '/shop/admin.html' && (userRole !== 'admin' || get_user_role()!== 'admin')) {
        window.location.href = 'shop.html';  // Redirect to non-admins to homepage
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

document.addEventListener('DOMContentLoaded', () => {
    crawler_check();
});