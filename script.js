document.addEventListener('DOMContentLoaded', async () => {

    // Set Current Year in Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    try {
        // Fetch data from data.json
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Could not load portfolio data');
        const data = await response.json();

        // Update Document Title
        document.title = `${data.personal.name} | Portfolio`;

        // Populate Navigation and Hero
        document.getElementById('navName').textContent = data.personal.name;
        document.getElementById('heroName').textContent = data.personal.name;
        document.getElementById('heroTitle').textContent = data.personal.title;
        document.getElementById('heroBio').textContent = data.personal.bio;

        // Populate About section
        document.getElementById('aboutBio').textContent = data.personal.bio;

        // Populate Skills
        const skillsList = document.getElementById('skillsList');
        data.skills.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            span.textContent = skill;
            skillsList.appendChild(span);
        });

        // Populate Projects
        const projectsList = document.getElementById('projectsList');
        data.projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            let tagsHtml = '';
            if (project.tags) {
                tagsHtml = `<div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>`;
            }

            card.innerHTML = `
                <h3 class="project-title">${project.title}</h3>
                ${tagsHtml}
                <p class="project-desc">${project.description}</p>
                <div class="project-links">
                    <a href="${project.link}" target="_blank" rel="noopener noreferrer">View Project →</a>
                </div>
            `;
            projectsList.appendChild(card);
        });

        // Populate Contact / Footer
        const socialLinks = document.getElementById('socialLinks');
        if (data.personal.email) {
            socialLinks.innerHTML += `<a href="mailto:${data.personal.email}">Email</a>`;
        }
        if (data.personal.github) {
            socialLinks.innerHTML += `<a href="${data.personal.github}" target="_blank">GitHub</a>`;
        }
        if (data.personal.linkedin) {
            socialLinks.innerHTML += `<a href="${data.personal.linkedin}" target="_blank">LinkedIn</a>`;
        }
        document.getElementById('footerName').textContent = data.personal.name;

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('heroName').textContent = "Error Loading Data";
        document.getElementById('heroName').style.color = "red";
    }

    // Scroll Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
});
