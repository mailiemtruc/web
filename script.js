
const canvas = document.getElementById('anime-particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particlesArray = [];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5; 
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        
        this.color = Math.random() > 0.5 
            ? 'rgba(45, 212, 191, 0.3)'  
            : 'rgba(139, 92, 246, 0.3)'; 
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.005;
        if (this.size <= 0.1) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
function initParticles() {
    particlesArray = [];
    // Nếu màn hình nhỏ hơn 768px (điện thoại) thì chỉ tạo 30 hạt, ngược lại 100 hạt
    let numberOfParticles = window.innerWidth < 768 ? 30 : 100; 
    
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle()); 
    }
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});


document.addEventListener("DOMContentLoaded", () => {
    fetch('ndwebtemp.txt')
        .then(response => {
            if (!response.ok) throw new Error("Cần chạy trên Live Server");
            return response.text();
        })
        .then(text => {
            parseContent(text);
        })
        .catch(error => console.error(error));
});

function cleanText(str) {
    if (!str) return "";
    return str.replace(/[-✅🛡️🗡️🔥👀📌]/g, '')
              .replace('Header:', '')
              .replace(/^\d+\.\s*/, '')
              .trim();
}

function parseContent(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== "");

    
    const heroTitleLine = lines.find(l => l.includes("CỘNG ĐỒNG DISCORD"));
    if (heroTitleLine) {
        let cleanTitle = cleanText(heroTitleLine)
            .replace("LIVESTREAM VÀ", "LIVESTREAM VÀ<br>")
            .replace("CÁC GAME NHÀ", "<br>CÁC GAME NHÀ");
        document.getElementById('hero-title').innerHTML = cleanTitle;
    }
    
    const startHeroDesc = lines.findIndex(l => l.includes("Nơi chat chit"));
    const endHeroDesc = lines.findIndex(l => l.includes("THAM GIA DISCORD"));
    if (startHeroDesc !== -1 && endHeroDesc !== -1) {
        let desc = lines.slice(startHeroDesc, endHeroDesc).map(l => cleanText(l)).join(" | ");
        document.getElementById('hero-desc').innerHTML = desc; 
    }

    
    const audienceContainer = document.getElementById('audience-container');
    const audienceKeywords = [
        { key: "Newbie", icon: "fa-seedling" },
        { key: "F2P", icon: "fa-mug-hot" },
        { key: "Game thủ lâu năm", icon: "fa-dragon" },
        { key: "Thích xem Livestream", icon: "fa-headset" },
        { key: "Chơi event", icon: "fa-gifts" } 
    ];

    let currentAudienceHTML = "";
    audienceKeywords.forEach(item => {
        const idx = lines.findIndex(l => l.includes(item.key));
        if (idx !== -1) {
            let parts = lines[idx].split('->');
            let title = cleanText(parts[0]);
            let content = cleanText(parts[1] || "");
            if (lines[idx + 1] && !lines[idx + 1].startsWith("-") && !lines[idx+1].includes("Quote")) {
                content += " " + cleanText(lines[idx + 1]);
            }
            
            currentAudienceHTML += `
            <div class="glass-card scroll-reveal js-tilt">
                <div class="card-icon"><i class="fas ${item.icon}"></i></div>
                <h3>${title}</h3>
                <div class="card-content">${content}</div>
            </div>`;
        }
    });
    audienceContainer.innerHTML = currentAudienceHTML;

    
    const quoteLine = lines.find(l => l.includes("Quote:"));
    if (quoteLine) document.getElementById('audience-quote').innerText = quoteLine.replace("Quote:", "").trim();
    else {
        const fallbackQuote = lines.find(l => l.includes("Không quan trọng bạn chơi giỏi"));
        if(fallbackQuote) document.getElementById('audience-quote').innerText = cleanText(fallbackQuote);
    }

    
    const featuresContainer = document.getElementById('features-container');
    const featuresMap = [
        { header: "Header: Hệ thống kênh chat đa dạng", icon: "fa-comments", color: "glow-purple" },
        { header: "Header: Minigame & Giveaway", icon: "fa-gift", color: "glow-cyan" },
        { header: "Header: Coin System nội bộ", icon: "fa-coins", color: "glow-purple" },
        { header: "Header: Dịch vụ game", icon: "fa-gamepad", color: "glow-cyan" }
    ];

    let featureHTML = "";
    featuresMap.forEach((feat, index) => {
        const idx = lines.findIndex(l => l.includes(feat.header));
        if (idx !== -1) {
            let contentList = "";
            for (let i = idx + 1; i < lines.length; i++) {
                if (lines[i].includes("Header:") || lines[i].includes("Môi trường") || lines[i].includes("4.")) break;
                contentList += `
                <div class="tech-item">
                    <i class="fas fa-caret-right tech-icon"></i>
                    <span>${cleanText(lines[i])}</span>
                </div>`;
            }
            const reverseClass = index % 2 !== 0 ? "reverse" : "";
            let displayTitle = feat.header.replace("Header:", "").trim();

            featureHTML += `
            <div class="feature-row ${reverseClass} scroll-reveal">
                <div class="feature-text">
                    <h3><i class="fas fa-terminal" style="font-size:0.8em; margin-right:10px"></i> ${displayTitle}</h3>
                    <div class="modern-grid" style="grid-template-columns: 1fr; gap: 10px; margin-top: 20px;">
                        ${contentList}
                    </div>
                </div>
                <div class="feature-visual ${feat.color}">
                    <i class="fas ${feat.icon}"></i>
                </div>
            </div>`;
        }
    });
    featuresContainer.innerHTML = featureHTML;

    const envIdx = lines.findIndex(l => l.includes("Môi trường thân thiện"));
    if (envIdx !== -1) {
        let envHTML = "";
        for (let i = envIdx + 1; i < lines.length; i++) {
            if (lines[i].includes("4.")) break;
            envHTML += `
            <div class="tech-item" style="border-left: 3px solid var(--neon-cyan)">
                <i class="fas fa-check tech-icon" style="color: var(--neon-cyan)"></i>
                <span>${cleanText(lines[i])}</span>
            </div>`;
        }
        document.getElementById('env-container').innerHTML = envHTML;
    }


    const adminIdx = lines.findIndex(l => l.includes("Giới thiệu về tui"));
    if (adminIdx !== -1) {
        document.getElementById('admin-desc').innerText = cleanText(lines[adminIdx + 1]);
        let adminListHTML = "";
        for (let i = adminIdx + 2; i < lines.length; i++) {
            if (lines[i].includes("5.")) break;
            adminListHTML += `<li><i class="fas fa-bolt highlight"></i> ${cleanText(lines[i])}</li>`;
        }
        document.getElementById('admin-list').innerHTML = adminListHTML;
    }


    const commitIdx = lines.findIndex(l => l.includes("5. CAM KẾT"));
    if (commitIdx !== -1) {
        let commitHTML = "";
        const icons = ["fa-hand-holding-heart", "fa-user-shield", "fa-balance-scale", "fa-lightbulb"];
        let iconCount = 0;
        for (let i = commitIdx + 1; i < lines.length; i++) {
            if (lines[i].includes("6.")) break;
            commitHTML += `
            <div class="commit-card">
                <div class="commit-icon-box"><i class="fas ${icons[iconCount % icons.length]}"></i></div>
                <div>${cleanText(lines[i])}</div>
            </div>`;
            iconCount++;
        }
        document.getElementById('commit-container').innerHTML = commitHTML;
        document.getElementById('commit-container').className = "commitment-grid";
    }


    const discordLink = lines.find(l => l.toLowerCase().includes("discord.gg"))?.split(/[:\s]+/)[1] || "#";
    const tiktokLink = lines.find(l => l.toLowerCase().includes("tiktok.com"))?.split(/[:\s]+/)[1] || "#";
    const fbLine = lines.find(l => l.toLowerCase().includes("facebook.com"));
    let fbLink = "#";
    if (fbLine) {
        const parts = fbLine.split(/[:\s]+/);
        fbLink = parts[parts.length - 1]; 
    }

    const dLink = "https://" + discordLink.replace('https://', '');
    document.getElementById('discord-link-nav').href = dLink;
    document.getElementById('discord-link-hero').href = dLink;

    document.getElementById('social-links').innerHTML = `
        <a href="${dLink}" target="_blank" class="social-btn"><i class="fab fa-discord"></i></a>
        <a href="https://${tiktokLink.replace('https://', '')}" target="_blank" class="social-btn"><i class="fab fa-tiktok"></i></a>
        <a href="https://${fbLink.replace('https://', '')}" target="_blank" class="social-btn"><i class="fab fa-facebook"></i></a>
    `;

    const footerQuoteStart = lines.findIndex(l => l.includes("Tâm Tình Đạo Hữu"));
    if (footerQuoteStart !== -1) {
        let quote = "";
        for (let i = footerQuoteStart; i < lines.length; i++) {
            quote += cleanText(lines[i]) + "\n";
        }
        document.getElementById('footer-quote').innerText = quote;
    }

    
    setTimeout(() => {
        reveal();
        initTiltEffect(); 
    }, 500);
}


function initTiltEffect() {
    // Nếu là điện thoại thì DỪNG NGAY, không chạy hiệu ứng này
    if (window.innerWidth < 1024) return; 

    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        // ... (Giữ nguyên code xử lý mousemove cũ ở trong đây) ...
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });
}


window.addEventListener('scroll', reveal);
function reveal() {
    var reveals = document.querySelectorAll('.scroll-reveal');
    for (var i = 0; i < reveals.length; i++) {
        var windowheight = window.innerHeight;
        var revealtop = reveals[i].getBoundingClientRect().top;
        var revealpoint = 100;
        if (revealtop < windowheight - revealpoint) {
            reveals[i].classList.add('active');
        }
    }
}


const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}


navItems.forEach(item => {
    item.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});


document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    }
});


const discordNav = document.getElementById('discord-link-nav');
const discordMobile = document.getElementById('discord-link-nav-mobile');
if (discordNav && discordMobile) {
    discordMobile.href = discordNav.href;
}