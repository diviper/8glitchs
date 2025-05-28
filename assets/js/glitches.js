// Инициализация канвасов
const tunnelCanvas = document.getElementById('tunnelCanvas');
const nonlocalityCanvas = document.getElementById('nonlocalityCanvas');
const observerCanvas = document.getElementById('observerCanvas');

// Настройка контекстов
const tunnelCtx = tunnelCanvas.getContext('2d');
const nonlocalityCtx = nonlocalityCanvas.getContext('2d');
const observerCtx = observerCanvas.getContext('2d');

// Установка размеров канвасов
function resizeCanvas(canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// Анимация квантового туннеля
class QuantumTunnel {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particle = {
            x: 50,
            y: canvas.height / 2,
            radius: 10,
            speed: 2,
            color: '#00ff00'
        };
        this.barrier = {
            x: canvas.width / 2 - 50,
            y: canvas.height / 2 - 100,
            width: 100,
            height: 200
        };
        this.tunneled = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем барьер
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(this.barrier.x, this.barrier.y, this.barrier.width, this.barrier.height);
        
        // Рисуем частицу
        this.ctx.beginPath();
        this.ctx.arc(this.particle.x, this.particle.y, this.particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.particle.color;
        this.ctx.fill();
        
        // Добавляем свечение
        this.ctx.shadowColor = this.particle.color;
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    update() {
        if (this.particle.x < this.barrier.x) {
            this.particle.x += this.particle.speed;
        } else if (!this.tunneled) {
            // Эффект туннелирования
            this.particle.x += this.particle.speed * 0.5;
            this.particle.color = '#ff00ff';
            if (this.particle.x > this.barrier.x + this.barrier.width) {
                this.tunneled = true;
                this.particle.color = '#00ff00';
            }
        } else {
            this.particle.x += this.particle.speed;
        }

        if (this.particle.x > this.canvas.width) {
            this.particle.x = 50;
            this.tunneled = false;
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Анимация нелокальности
class Nonlocality {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [
            { x: canvas.width / 3, y: canvas.height / 2, color: '#00ff00' },
            { x: canvas.width * 2/3, y: canvas.height / 2, color: '#00ff00' }
        ];
        this.angle = 0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем частицы
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 20;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        // Рисуем связь
        this.ctx.beginPath();
        this.ctx.moveTo(this.particles[0].x, this.particles[0].y);
        this.ctx.lineTo(this.particles[1].x, this.particles[1].y);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.stroke();
    }

    update() {
        this.angle += 0.02;
        this.particles[0].y = this.canvas.height / 2 + Math.sin(this.angle) * 50;
        this.particles[1].y = this.canvas.height / 2 + Math.sin(this.angle + Math.PI) * 50;
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Анимация проблемы наблюдателя
class ObserverEffect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.wave = [];
        this.observed = false;
        this.particle = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 5
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.observed) {
            // Рисуем волновую функцию
            this.ctx.beginPath();
            for (let x = 0; x < this.canvas.width; x += 5) {
                const y = this.canvas.height / 2 + Math.sin(x * 0.05) * 50;
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.stroke();
        } else {
            // Рисуем частицу
            this.ctx.beginPath();
            this.ctx.arc(this.particle.x, this.particle.y, this.particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 20;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }

    update() {
        if (Math.random() < 0.01) {
            this.observed = !this.observed;
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Инициализация анимаций
window.addEventListener('load', () => {
    resizeCanvas(tunnelCanvas);
    resizeCanvas(nonlocalityCanvas);
    resizeCanvas(observerCanvas);

    const tunnel = new QuantumTunnel(tunnelCanvas, tunnelCtx);
    const nonlocality = new Nonlocality(nonlocalityCanvas, nonlocalityCtx);
    const observer = new ObserverEffect(observerCanvas, observerCtx);

    tunnel.animate();
    nonlocality.animate();
    observer.animate();
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    resizeCanvas(tunnelCanvas);
    resizeCanvas(nonlocalityCanvas);
    resizeCanvas(observerCanvas);
}); 