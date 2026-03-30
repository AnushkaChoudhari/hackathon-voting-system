/**
 * HACKVOTE Admin Intelligence Dashboard
 * Connected to FastAPI Backend for Real-Time Analytics
 */

const API_BASE = "http://127.0.0.1:8000";
let voteChart = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Dashboard: Connecting to backend...');

    // Initial load
    refreshDashboard();

    // Auto-refresh every 4 seconds
    setInterval(refreshDashboard, 4000);

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('adminToken');
                window.location.href = 'index.html';
            }
        });
    }
});

/**
 * Update all dashboard sections
 */
async function refreshDashboard() {
    try {
        await loadDashboardStats();
        await loadVotingMixChart();
        await loadLeaderboard();
        await loadProjectStats();
        await loadLiveVotes();
    } catch (error) {
        console.error("Error refreshing dashboard:", error);
    }
}

/**
 * Fetch and update total engagement statistics
 */
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        if (data) {
            document.getElementById('totalProjects').textContent = data.total_projects;
            document.getElementById('totalVotes').textContent = data.total_votes;
            document.getElementById('bestVotes').textContent = data.best_votes;
            document.getElementById('studentsVoted').textContent = data.students_voted;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Fetch and update the Voting Mix (Donut Chart)
 */
async function loadVotingMixChart() {

    try {

        const response = await fetch(`${API_BASE}/admin/voting-mix`);

        if (!response.ok) {
            throw new Error("Voting mix API failed");
        }

        const data = await response.json();

        const values = [
            Number(data.best || 0),
            Number(data.good || 0),
            Number(data.moderate || 0)
        ];

        const canvas = document.getElementById("voteChart");

        if (!canvas) {
            console.error("voteChart canvas not found");
            return;
        }

        const ctx = canvas.getContext("2d");

        if (voteChart) {
            voteChart.destroy();
        }

        voteChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Best", "Good", "Moderate"],
                datasets: [{
                    data: values,
                    backgroundColor: [
                        "#10b981",
                        "#f59e0b",
                        "#ef4444"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });

    } catch (error) {
        console.error("Voting Mix Chart Error:", error);
    }

}

/**
 * Fetch and update the Elite Top 5 Leaderboard
 */
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/admin/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();

        const container = document.getElementById('leaderboardList');
        container.innerHTML = ''; // Clear previous

        data.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-item animate-fade';
            row.innerHTML = `
                <div class="team-info">
                    <span class="rank">#${index + 1}</span>
                    <span class="project-name">${item.project_name || 'Team ' + item.team_id}</span>
                </div>
                <span class="votes-badge">${item.votes} Votes</span>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

/**
 * Fetch and update the comprehensive Project Stats Table
 */
async function loadProjectStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/project-stats`);
        if (!response.ok) throw new Error('Failed to fetch project stats');
        const data = await response.json();

        const tableBody = document.getElementById('projectTableBody');
        tableBody.innerHTML = ''; // Clear previous

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="project-cell">
                        <span class="project-name">Team ${item.team_id}</span>
                        <span class="team-name">HackVoter Entry</span>
                    </div>
                </td>
                <td>${item.best || 0}</td>
                <td>${item.good || 0}</td>
                <td>${item.moderate || 0}</td>
                <td style="font-weight: 700;">${item.total}</td>
                <td>
                    <div class="action-btns" style="justify-content: flex-end;">
                        <button class="btn btn-icon btn-edit"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon btn-delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading project stats table:', error);
    }
}

/**
 * Fetch and update Live Voting Activity Feed
 */
async function loadLiveVotes() {
    try {
        const response = await fetch(`${API_BASE}/admin/live-votes`);
        if (!response.ok) throw new Error('Failed to fetch live votes');
        const data = await response.json();

        const feed = document.getElementById('liveVotes');
        feed.innerHTML = ''; // Clear previous

        // Show most recent on top
        const recent = [...data].reverse();

        recent.forEach(vote => {
            const activity = document.createElement('div');
            activity.className = 'leaderboard-item';
            activity.style.padding = '10px 15px';
            activity.style.fontSize = '0.9rem';

            const ratingColor = vote.rating === 'best' ? '#10b981' : (vote.rating === 'good' ? '#f59e0b' : '#ef4444');

            activity.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-circle" style="font-size: 0.6rem; color: #10b981;"></i>
                    <span><strong>${vote.student_name}</strong> voted <span style="color: ${ratingColor}; font-weight: 700;">${vote.rating.toUpperCase()}</span> for <strong>Team ${vote.team_id}</strong></span>
                </div>
                <span style="color: var(--text-muted); font-size: 0.8rem;">just now</span>
            `;
            feed.appendChild(activity);
        });
    } catch (error) {
        console.error('Error loading live activity feed:', error);
    }
}
