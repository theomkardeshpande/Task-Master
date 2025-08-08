// Google OAuth Configuration
//const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    // This will be called when the Google API is loaded
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        
        // Render the button
        google.accounts.id.renderButton(
            document.getElementById('google-signin-btn-container'),
            {
                theme: 'outline',
                size: 'large',
                width: '100%',
                type: 'standard',
                shape: 'rectangular',
                text: 'continue_with',
                logo_alignment: 'left'
            }
        );
    }
}

// Handle Google Sign-In Response
function handleGoogleSignIn(response) {
    console.log('Google Sign-In Response:', response);
    
    try {
        // Show loading state
        showLoadingState();
        
        // Decode the JWT token (you should validate this on your server)
        const userInfo = parseJwt(response.credential);
        console.log('User Info:', userInfo);
        
        // Send the credential to your server for verification
        authenticateWithGoogle(response.credential)
            .then(result => {
                if (result.success) {
                    showSuccessMessage('Successfully signed in with Google!');
                    
                    // Redirect to dashboard or home page after a brief delay
                    setTimeout(() => {
                        window.location.href = '/dashboard'; // Change to your desired redirect URL
                    }, 1500);
                } else {
                    throw new Error(result.message || 'Authentication failed');
                }
            })
            .catch(error => {
                console.error('Authentication error:', error);
                showErrorMessage('Failed to sign in with Google. Please try again.');
            })
            .finally(() => {
                hideLoadingState();
            });
            
    } catch (error) {
        console.error('Error processing Google sign-in:', error);
        showErrorMessage('Failed to process sign-in. Please try again.');
        hideLoadingState();
    }
}

// Initiate Google Sign-In (for custom button)
function initiateGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback to popup if one-tap is not available
                console.log('One-tap not available, showing popup...');
                // You can implement popup sign-in here if needed
            }
        });
    } else {
        console.error('Google Sign-In API not loaded');
        showErrorMessage('Google Sign-In is not available. Please try again later.');
    }
}

// Send credential to server for authentication
async function authenticateWithGoogle(credential) {
    try {
        const response = await fetch('/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                credential: credential,
                _token: getCSRFToken() // If you're using CSRF protection
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Server authentication error:', error);
        throw error;
    }
}

// Utility function to parse JWT token (client-side only - validate on server!)
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// Get CSRF token if using Laravel or similar framework
function getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

// UI Helper Functions
function showLoadingState() {
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="animate-spin w-5 h-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
        `;
    }
}

function hideLoadingState() {
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="group-hover:text-slate-900 transition-colors duration-200">Continue with Google</span>
        `;
    }
}

function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToast = document.getElementById('oauth-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'oauth-toast';
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Sign-In when the API is ready
    if (typeof google !== 'undefined') {
        initializeGoogleSignIn();
    } else {
        // Wait for Google API to load
        window.addEventListener('load', function() {
            setTimeout(initializeGoogleSignIn, 1000);
        });
    }
});
