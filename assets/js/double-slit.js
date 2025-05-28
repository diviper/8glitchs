class DoubleSlitExperiment {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isObserving = false;
        this.particles = [];
        this.screen = [];
        this.slitWidth = 10;
        this.slitSeparation = 100;
        this.particleSpeed = 2;
        this.maxParticles = 1000;
        this.screenWidth = 20;
        
        this.init();
    }
    
    init() {
        // Установка размеров canvas
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Позиции щелей
        this.slit1X = this.canvas.width / 2 - this.slitSeparation / 2;
        this.slit2X = this.canvas.width / 2 + this.slitSeparation / 2;
        this.slitY = this.canvas.height / 2;
        
        // Инициализация экрана
        this.screenX = this.canvas.width - 50;
        for (let i = 0; i < this.canvas.height; i++) {
            this.screen[i] = 0;
        }
        
        // Запуск анимации
        this.animate();
        
        // Обработчики событий
        document.getElementById('toggleObservation').addEventListener('click', () => {
            this.isObserving = !this.isObserving;
            document.getElementById('toggleObservation').textContent = 
                this.isObserving ? 'Выключить наблюдение' : 'Включить наблюдение';
        });
        
        document.getElementById('resetDemo').addEventListener('click', () => {
            this.reset();
        });
    }
    
    reset() {
        this.particles = [];
        this.screen = new Array(this.canvas.height).fill(0);
        this.isObserving = false;
        document.getElementById('toggleObservation').textContent = 'Включить наблюдение';
    }
    
    createParticle() {
        if (this.particles.length < this.maxParticles) {
            const particle = {
                x: 50,
                y: this.canvas.height / 2 + (Math.random() - 0.5) * 50,
                vx: this.particleSpeed,
                vy: 0,
                observed: false
            };
            this.particles.push(particle);
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Движение частицы
            p.x += p.vx;
            p.y += p.vy;
            
            // Проверка прохождения через щели
            if (p.x >= this.slit1X && p.x <= this.slit1X + this.slitWidth && 
                Math.abs(p.y - this.slitY) < this.slitWidth) {
                if (this.isObserving) {
                    p.observed = true;
                    p.vy = 0;
                } else {
                    // Волновое поведение
                    p.vy = Math.sin(p.x * 0.1) * 2;
                }
            }
            
            if (p.x >= this.slit2X && p.x <= this.slit2X + this.slitWidth && 
                Math.abs(p.y - this.slitY) < this.slitWidth) {
                if (this.isObserving) {
                    p.observed = true;
                    p.vy = 0;
                } else {
                    // Волновое поведение
                    p.vy = Math.sin(p.x * 0.1) * 2;
                }
            }
            
            // Регистрация на экране
            if (p.x >= this.screenX) {
                const screenY = Math.floor(p.y);
                if (screenY >= 0 && screenY < this.canvas.height) {
                    this.screen[screenY]++;
                }
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисование барьера со щелями
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.slit1X - 5, 0, this.slitWidth + 10, this.canvas.height);
        this.ctx.fillRect(this.slit2X - 5, 0, this.slitWidth + 10, this.canvas.height);
        
        // Рисование щелей
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.slit1X, this.slitY - this.slitWidth/2, this.slitWidth, this.slitWidth);
        this.ctx.fillRect(this.slit2X, this.slitY - this.slitWidth/2, this.slitWidth, this.slitWidth);
        
        // Рисование частиц
        this.ctx.fillStyle = '#009ffd';
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Рисование экрана
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.screenX, 0, this.screenWidth, this.canvas.height);
        
        // Рисование интерференционной картины
        this.ctx.fillStyle = '#ff6b6b';
        for (let i = 0; i < this.canvas.height; i++) {
            const intensity = this.screen[i] / 10;
            this.ctx.fillRect(this.screenX + this.screenWidth, i, intensity, 1);
        }
    }
    
    animate() {
        this.createParticle();
        this.updateParticles();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Инициализация эксперимента при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new DoubleSlitExperiment('doubleSlitCanvas');
}); 