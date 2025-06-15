const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const profileDiv = document.getElementById('profile');
const loader = document.getElementById('loader');
const usernameInput = document.getElementById('username');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

// Function to show custom message box
function showMessageBox(message) {
    messageText.textContent = message;
    messageBox.style.display = 'block';
    // Add specific class for message box for dark mode if needed
    if (body.classList.contains('dark')) {
        messageBox.classList.add('dark-mode');
    } else {
        messageBox.classList.remove('dark-mode');
    }
}

// Function to close custom message box
function closeMessageBox() {
    messageBox.style.display = 'none';
}

// Initialize theme based on localStorage or default to light
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    body.classList.add(currentTheme);
    themeToggle.checked = currentTheme === 'dark';
} else {
    body.classList.add('light'); // Default to light mode
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.remove('light');
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark');
        body.classList.add('light');
        localStorage.setItem('theme', 'light');
    }
    // Update message box style immediately on theme change
    if (messageBox.style.display === 'block') {
        if (body.classList.contains('dark')) {
            messageBox.classList.add('dark-mode');
        } else {
            messageBox.classList.remove('dark-mode');
        }
    }
});

async function getProfile() {
    const username = usernameInput.value.trim();
    if (!username) {
        showMessageBox('Please enter a GitHub username.');
        return;
    }

    profileDiv.innerHTML = ''; // Clear previous profile data
    loader.style.display = 'block'; // Show loader

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            if (response.status === 404) {
                showMessageBox(`User "${username}" not found.`);
            } else {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            return;
        }
        const data = await response.json();
        displayProfile(data);
    } catch (error) {
        console.error('Error fetching GitHub profile:', error);
        showMessageBox(`Failed to fetch profile: ${error.message}. Please try again.`);
    } finally {
        loader.style.display = 'none'; // Hide loader
    }
}

function displayProfile(data) {
    const joinedDate = new Date(data.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    profileDiv.innerHTML = `
        <div class="profile-card">
            <img
                src="${data.avatar_url}"
                alt="${data.login}"
                class="profile-avatar"
            />
            <div class="profile-details-section">
                <h2>
                    ${data.name || data.login}
                </h2>
                <p class="profile-username-link">
                    <a href="${data.html_url}" target="_blank" rel="noopener noreferrer">@${data.login}</a>
                </p>
                <p class="profile-bio">
                    ${data.bio || '<em>No bio available.</em>'}
                </p>
                <div class="profile-info-grid">
                    ${data.location ? `<p class="profile-info-item"><svg xmlns="http://www.w3.org/2000/svg" class="profile-icon" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg> ${data.location}</p>` : ''}
                    ${data.twitter_username ? `<p class="profile-info-item"><svg xmlns="http://www.w3.org/2000/svg" class="profile-icon" viewBox="0 0 20 20" fill="currentColor"> <path d="M11.973 2.196a8.04 8.04 0 01-1.343.344A8.04 8.04 0 0110 2a8 8 0 00-8 8c0 1.98.67 3.84 1.8 5.37l-1.5 1.5 1.5-1.5c1.47 1.13 3.32 1.8 5.37 1.8A8 8 0 0018 10a8 8 0 00-8-8zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" /></svg> <a href="https://twitter.com/${data.twitter_username}" target="_blank" rel="noopener noreferrer">@${data.twitter_username}</a></p>` : ''}
                    ${data.blog ? `<p class="profile-info-item"><svg xmlns="http://www.w3.org/2000/svg" class="profile-icon" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clip-rule="evenodd" /></svg> <a href="${data.blog}" target="_blank" rel="noopener noreferrer">${data.blog.replace(/^https?:\/\/(www\.)?/, '')}</a></p>` : ''}
                    <p class="profile-info-item"><svg xmlns="http://www.w3.org/2000/svg" class="profile-icon" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg> Joined: ${joinedDate}</p>
                </div>
                <div class="profile-stats">
                    <p><span class="stat-number">${data.followers}</span> Followers</p>
                    <p><span class="stat-number">${data.following}</span> Following</p>
                    <p><span class="stat-number">${data.public_repos}</span> Repos</p>
                </div>
            </div>
        </div>
    `;
}

// Handle Enter key press on the input field
usernameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getProfile();
    }
});
