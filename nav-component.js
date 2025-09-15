// nav-component.js
function insertNavigation() {
    const isLoggedIn = localStorage.getItem('agencyLoggedIn') === 'true';

    const navHTML = `
        <nav class="navbar" style="position: fixed; top: 0; width: 100%; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; padding: 15px 0;">
            <div class="nav-container" style="max-width: 1280px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center;">
                <a href="/" class="logo" style="font-size: 24px; font-weight: 700; color: #667eea; text-decoration: none;">
                    📋 NoLossForm
                </a>
                <div class="nav-links" style="display: flex; gap: 30px; align-items: center;">
                    <a href="/" style="color: #333; text-decoration: none;">Home</a>
                    ${isLoggedIn ? `
                        <a href="/agent-portal.html" style="color: #333; text-decoration: none;">Generate Link</a>
                        <a href="/dashboard.html" style="color: #333; text-decoration: none;">Dashboard</a>
                        <a href="#" onclick="logout()" style="color: #333; text-decoration: none;">Logout</a>
                    ` : `
                        <a href="/#features" style="color: #333; text-decoration: none;">Features</a>
                        <a href="/#pricing" style="color: #333; text-decoration: none;">Pricing</a>
                        <a href="/login.html" style="background: #667eea; color: white; padding: 8px 20px; border-radius: 20px; text-decoration: none;">Login</a>
                    `}
                </div>
            </div>
        </nav>
        <div style="height: 70px;"></div>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

function logout() {
    localStorage.removeItem('agencyLoggedIn');
    localStorage.removeItem('agencyEmail');
    window.location.href = '/login.html';
}

// Auto-insert navigation when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertNavigation);
} else {
    insertNavigation();
}