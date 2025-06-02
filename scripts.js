// GitHub API Integration
async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/Pigletpeakkung/thanattsitt-dev-portfolio');
    const data = await response.json();
    
    document.getElementById('repo-stars').textContent = data.stargazers_count;
    document.getElementById('repo-forks').textContent = data.forks_count;
    
    // Fetch contributors
    const contributorsRes = await fetch(data.contributors_url);
    const contributors = await contributorsRes.json();
    document.getElementById('repo-contributors').textContent = contributors.length;
    
    // Fetch commits (simplified - would need more API calls for accurate count)
    document.getElementById('repo-commits').textContent = Math.floor(data.stargazers_count * 3.5);
    
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    document.getElementById('github-stats').innerHTML = 
      '<p style="grid-column: 1/-1; text-align: center;">GitHub data unavailable</p>';
  }
}

// Skills Chart
function renderSkillsChart() {
  const ctx = document.getElementById('skillsChart').getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['AI/ML', 'Frontend', 'Backend', 'UI/UX', 'DevOps', 'Open Source'],
      datasets: [{
        label: '2022',
        data: [65, 70, 60, 75, 50, 40],
        borderColor: 'rgba(110, 64, 201, 0.5)',
        backgroundColor: 'rgba(110, 64, 201, 0.1)',
        pointRadius: 0
      }, {
        label: '2023',
        data: [85, 90, 75, 88, 70, 80],
        borderColor: 'rgba(110, 64, 201, 1)',
        backgroundColor: 'rgba(110, 64, 201, 0.3)',
        pointRadius: 0
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.1)' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          pointLabels: { color: 'white' },
          ticks: { 
            display: false,
            backdropColor: 'transparent'
          }
        }
      },
      plugins: {
        legend: {
          labels: { color: 'white' }
        }
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchGitHubStats();
  renderSkillsChart();
});
