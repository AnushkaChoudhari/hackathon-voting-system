// Dashboard Logic for HackVote
const API_BASE_URL = "http://127.0.0.1:8000";

document.addEventListener('DOMContentLoaded', () => {
    // 6. Page Initialization
    // Verify the student is logged in by checking localStorage student_name
    const studentName = localStorage.getItem("student_name");
    if (!studentName) {
        // If not logged in redirect to login page
        window.location.href = "login.html";
        return;
    }
    
    // Display student name (optional UI update)
    const displayPRN = document.getElementById('display-prn');
    if (displayPRN) displayPRN.innerText = studentName;

    // Call loadTeams()
    loadTeams();
    
    // Check for existing votes in localStorage to persist UI state (optional but good)
    renderSavedVotes();
});

/**
 * 5. JavaScript Structure - loadTeams()
 * Fetches /teams, loops through the teams, generates cards dynamically, inserts them into the projectsContainer
 */
async function loadTeams() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    try {
        // Show loader first (already in HTML, but good to handle)
        container.innerHTML = `
            <div class="loader-container">
                <div class="complex-loader"></div>
                <p style="color: var(--text-muted); font-weight: 600;">Loading amazing projects...</p>
            </div>
        `;

        // 1. Load Teams on Dashboard
        const response = await fetch(`${API_BASE_URL}/teams`);
        const data = await response.json();

        if (data.status === "success") {
            const teams = data.teams;
            container.innerHTML = ""; // Clear loader

            if (teams.length === 0) {
                container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: var(--text-muted);">No projects found.</p>`;
                return;
            }

            // Loop through the teams and generate cards
            teams.forEach(team => {
                const card = createProjectCard(team);
                container.appendChild(card);
            });
            
            // Update progress text
            totalTeamsCount = teams.length;
            setTimeout(() => updateVoteProgress(totalTeamsCount), 100);
        } else {
            showToast("Failed to load teams. Please try again.", "error");
        }
    } catch (error) {
        console.error("Error loading teams:", error);
        showToast("Error connecting to backend.", "error");
        container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: var(--danger);">Unable to connect to the server. Is the backend running?</p>`;
    }
}

/**
 * 2. Project Card Layout
 * Each card must display Team Name, Project Name, Rating buttons, and Submit Vote button.
 */
function createProjectCard(team) {
    const card = document.createElement('div');
    card.className = 'project-card staggered-entry';
    card.id = `card-${team.team_id}`;
    
    // Check if user already voted for this team in this session
    const hasVoted = localStorage.getItem(`voted_${team.team_id}`);
    
    card.innerHTML = `
        <div class="team-badge">Team: ${team.team_name}</div>
        <h3 style="margin-bottom: 5px;">${team.project_name}</h3>
        <p style="font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-bottom: 20px;">
            Theme: ${team.theme || 'Not specified'}
        </p>
        
        <div class="vote-actions" id="actions-${team.team_id}">
            <button class="vote-btn best" onclick="selectRating(${team.team_id}, 'Best', this)" title="Outstanding execution!">
                <i class="fas fa-crown"></i>
                <span class="btn-label">Best</span>
            </button>
            <button class="vote-btn good" onclick="selectRating(${team.team_id}, 'Good', this)" title="Very well done">
                <i class="fas fa-star"></i>
                <span class="btn-label">Good</span>
            </button>
            <button class="vote-btn moderate" onclick="selectRating(${team.team_id}, 'Moderate', this)" title="Solid project">
                <i class="fas fa-thumbs-up"></i>
                <span class="btn-label">Moderate</span>
            </button>
        </div>
        
        <div id="selection-status-${team.team_id}" style="margin-top: 15px; text-align: center; height: 1.2rem;">
            <span class="selected-text" style="font-size: 0.8rem; font-weight: 700; color: var(--primary); display: none;">
                Selected: <span class="rating-label"></span>
            </span>
        </div>

        <button class="btn btn-primary submit-vote-btn" 
                onclick="handleVoteSubmit(${team.team_id})" 
                style="margin-top: 15px; width: 100%; padding: 10px; border-radius: 10px; font-weight: 700; background: var(--primary);">
            Submit Vote
        </button>
    `;

    if (hasVoted) {
        setTimeout(() => applyVotedState(team.team_id), 0);
    }

    return card;
}

// Global variable to keep track of temporary selections before submission
const selections = {};
let totalTeamsCount = 0; // Store total teams for progress tracking

/**
 * Handles visual selection of a rating before submission
 */
function selectRating(teamId, rating, element) {
    // Save selection
    selections[teamId] = rating;
    
    // Clear other active buttons in this card
    const buttons = element.parentElement.querySelectorAll('.vote-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mark this one as active
    element.classList.add('active');
    element.style.borderColor = 'var(--primary)';
    
    // Show selection status
    const statusContainer = document.getElementById(`selection-status-${teamId}`);
    if (statusContainer) {
        const textSpan = statusContainer.querySelector('.selected-text');
        const labelSpan = statusContainer.querySelector('.rating-label');
        textSpan.style.display = 'inline-block';
        labelSpan.innerText = rating;
    }
}

/**
 * Handles the submit button click
 */
function handleVoteSubmit(teamId) {
    const rating = selections[teamId];
    if (!rating) {
        showToast("Please select a rating (Best, Good, or Moderate) first.", "error");
        return;
    }
    
    // 5. JavaScript Structure - Call submitVote()
    submitVote(teamId, rating);
}

/**
 * 5. JavaScript Structure - submitVote(teamId, rating)
 * Sends POST request to /vote, shows success message, disables voting UI
 */
async function submitVote(teamId, rating) {
    const studentName = localStorage.getItem("student_name");
    
    // 3. Submit Vote Function payload
    const payload = {
        student_name: studentName,
        team_id: parseInt(teamId),
        rating: rating
    };

    try {
        const response = await fetch(`${API_BASE_URL}/vote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === "success") {
            // 4. Success Feedback
            showToast("Vote submitted successfully!", "success");
            
            // Save to localStorage to persist UI state
            localStorage.setItem(`voted_${teamId}`, rating);
            
            // Disable voting UI for this team to prevent duplicate votes
            applyVotedState(teamId);
            
            // Update progress (re-calculate based on storage)
            updateVoteProgress();
        } else {
            showToast(result.message || "Failed to submit vote.", "error");
        }
    } catch (error) {
        console.error("Error submitting vote:", error);
        showToast("Error connecting to backend.", "error");
    }
}

/**
 * Disables the voting UI for a card after a vote is cast
 */
function applyVotedState(teamId) {
    const card = document.getElementById(`card-${teamId}`);
    if (!card) return;

    const rating = localStorage.getItem(`voted_${teamId}`);
    
    // Update card styling
    card.classList.add('voted');
    card.style.borderColor = "var(--success)";
    
    // Clear selection UI
    const statusContainer = document.getElementById(`selection-status-${teamId}`);
    if (statusContainer) statusContainer.innerHTML = '';

    // Replace actions and button with a success message
    const actions = card.querySelector('.vote-actions');
    const submitBtn = card.querySelector('.submit-vote-btn');
    
    if (actions) {
        actions.innerHTML = `
            <div class="voted-msg" style="width: 100%; background: #dcfce7; color: #166534; padding: 12px; border-radius: 8px; font-weight: 700; text-align: center;">
                <i class="fas fa-check-circle"></i> Voted: ${rating || 'Completed'}
            </div>
        `;
    }
    
    if (submitBtn) submitBtn.remove();
}

/**
 * Updates the progress bar and stats
 * This function calculates votes completed, updates progress text, and adjusts progress bar width
 */
async function updateVoteProgress(countFromAPI = null) {
    let totalTeams = countFromAPI || totalTeamsCount;

    // If total count is still 0/null, fetch it from API or use current cards
    if (!totalTeams) {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`);
            const data = await response.json();
            if (data.status === "success") {
                totalTeams = data.teams.length;
                totalTeamsCount = totalTeams; // Cache it
            } else {
                totalTeams = document.querySelectorAll('.project-card').length;
            }
        } catch (error) {
            totalTeams = document.querySelectorAll('.project-card').length;
        }
    }

    // Determine how many projects the student has voted for
    // Counts cards that have the 'voted' class (which implies they show "Voted: ..." or buttons are disabled)
    const votedTeamsCount = document.querySelectorAll('.project-card.voted').length;
    
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-indicator');
    const progressPercentText = document.getElementById('progress-percent-text');
    
    // Update progress text format: "You have voted for X / TOTAL teams"
    if (progressText) {
        progressText.innerText = `You have voted for ${votedTeamsCount} / ${totalTeams} teams`;
    }
    
    // Adjust progress bar width with smooth animation
    if (progressBar && totalTeams > 0) {
        const percent = (votedTeamsCount / totalTeams) * 100;
        progressBar.style.width = `${percent}%`;
        if (progressPercentText) progressPercentText.innerText = `${Math.round(percent)}%`;
    }
}

/**
 * Renders state for saved votes from localStorage
 */
function renderSavedVotes() {
    // We already handle card-specific states in createProjectCard
    // This call ensures the progress tracker is consistent with the cards
    setTimeout(() => {
        updateVoteProgress();
    }, 100);
}

/**
 * 3. Search Bar Functionality
 * Filters project cards based on the team name in the search bar.
 */
function filterTeams() {
    const searchInput = document.getElementById('search-projects');
    const filter = searchInput.value.toLowerCase();
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const teamBadge = card.querySelector('.team-badge');
        if (teamBadge) {
            const teamName = teamBadge.innerText.toLowerCase();
            if (teamName.includes(filter)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        }
    });

    // Optionally update progress display or show "no results" message
    const visibleCards = Array.from(projectCards).filter(card => card.style.display !== "none");
    const container = document.getElementById("projectsContainer");
    
    // If no results, show a message
    let noResultsMsg = document.getElementById('no-results-msg');
    if (visibleCards.length === 0 && filter !== "") {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.id = 'no-results-msg';
            noResultsMsg.style.cssText = "text-align: center; grid-column: 1/-1; padding: 40px; color: var(--text-muted);";
            noResultsMsg.innerText = "No teams found matching your search.";
            container.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

/**
 * Helper to show toast notifications (copied from main.js for self-containment)
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    // Inline styling for immediate visibility since I can't guarantee CSS existence for new classes
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    toast.style.fontWeight = '600';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.animation = 'fadeInSlide 0.3s ease-out';
    
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}
