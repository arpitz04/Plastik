
  (function ($) {
  
  "use strict";

    // PRE LOADER
    $(window).load(function(){
      $('.preloader').delay(500).slideUp('slow'); // set duration in brackets    
    });

    // NAVBAR
    $(".navbar").headroom();

    $('.navbar-collapse a').click(function(){
        $(".navbar-collapse").collapse('hide');
    });

    $('.slick-slideshow').slick({
      autoplay: true,
      infinite: true,
      arrows: false,
      fade: true,
      dots: true,
    });

    $('.slick-testimonial').slick({
      arrows: false,
      dots: true,
    });
    
  })(window.jQuery);
// frontend/js/custom.js (add to the end or start of your script)

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const rewardPoints = localStorage.getItem('rewardPoints');

    const signInLink = document.getElementById('signInLink');
    const signUpLink = document.getElementById('signUpLink');
    const userProfileLink = document.getElementById('userProfileLink');
    const userPointsDisplay = document.getElementById('userPointsDisplay');
    const logoutButton = document.getElementById('logoutButton'); // Add a logout button to your HTML

    if (token && username) {
        // User is logged in
        if (signInLink) signInLink.style.display = 'none';
        if (signUpLink) signUpLink.style.display = 'none';

        if (userProfileLink) {
            userProfileLink.innerHTML = `Welcome, ${username}!`;
            userProfileLink.href = 'profile.html'; // Link to a profile page (if you create one)
            userProfileLink.style.display = 'block'; // Make sure it's visible
        }
        if (userPointsDisplay) {
            userPointsDisplay.textContent = `Points: ${rewardPoints}`;
            userPointsDisplay.style.display = 'block'; // Make sure it's visible
        }
        if (logoutButton) {
            logoutButton.style.display = 'block'; // Make logout visible
            logoutButton.addEventListener('click', () => {
                localStorage.clear(); // Clear all user data
                window.location.href = 'index.html'; // Redirect to home
            });
        }
        fetchUserProfile(); // Fetch latest profile info (points might change)
    } else {
        // User is not logged in
        if (signInLink) signInLink.style.display = 'block';
        if (signUpLink) signUpLink.style.display = 'block';
        if (userProfileLink) userProfileLink.style.display = 'none';
        if (userPointsDisplay) userPointsDisplay.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
    }

    // Function to fetch and update user profile (e.g., points)
    async function fetchUserProfile() {
        const token = localStorage.getItem('token');
        if (!token) return; // Not logged in

        try {
            const response = await fetch('http://localhost:5000/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('rewardPoints', userData.rewardPoints); // Update points
                if (userPointsDisplay) {
                    userPointsDisplay.textContent = `Points: ${userData.rewardPoints}`;
                }
                // Optionally update username if changed on backend
                localStorage.setItem('username', userData.username);
                if (userProfileLink) {
                    userProfileLink.innerHTML = `Welcome, ${userData.username}!`;
                }
            } else if (response.status === 401 || response.status === 403) {
                // Token expired or invalid
                alert('Your session has expired. Please log in again.');
                localStorage.clear();
                window.location.href = 'sign-in.html';
            } else {
                console.error('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }
});