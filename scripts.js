// Анимации появления элементов
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Наблюдаем за всеми секциями
    document.querySelectorAll('.glitch-section').forEach(section => {
        observer.observe(section);
    });

    // Эффект глитча для заголовков
    document.querySelectorAll('.glitch-text').forEach(element => {
        const text = element.getAttribute('data-text') || element.textContent;
        element.setAttribute('data-text', text);
        
        element.addEventListener('mouseover', () => {
            element.classList.add('glitch-active');
        });
        
        element.addEventListener('mouseout', () => {
            element.classList.remove('glitch-active');
        });
    });

    // Параллакс эффект для номеров глитчей
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        document.querySelectorAll('.glitch-number').forEach(number => {
            number.style.transform = `translateY(${rate}px)`;
        });
    });
});

// Функции для интерактивных экспериментов
const experiments = {
    // Эксперимент с двойной щелью
    doubleSlit: {
        init: function() {
            this.detectorActive = false;
            this.experimentRunning = false;
            this.setupEventListeners();
        },

        setupEventListeners: function() {
            const detector = document.getElementById('detector');
            if (detector) {
                detector.addEventListener('click', () => this.toggleDetector());
            }
        },

        toggleDetector: function() {
            this.detectorActive = !this.detectorActive;
            const detector = document.getElementById('detector');
            if (detector) {
                detector.classList.toggle('active');
            }
        },

        fireElectrons: function() {
            if (this.experimentRunning) return;
            this.experimentRunning = true;
            
            // Анимация запуска электронов
            setTimeout(() => {
                this.experimentRunning = false;
            }, 2000);
        }
    },

    // Эксперимент с квантовой запутанностью
    entanglement: {
        init: function() {
            this.experimentState = 'idle';
            this.totalTests = 0;
            this.correlatedTests = 0;
            this.setupEventListeners();
        },

        setupEventListeners: function() {
            const crystal = document.getElementById('crystal');
            if (crystal) {
                crystal.addEventListener('click', () => this.createEntangledPhotons());
            }
        },

        createEntangledPhotons: function() {
            if (this.experimentState !== 'idle') return;
            this.experimentState = 'creating';
            
            // Анимация создания запутанных фотонов
            setTimeout(() => {
                this.experimentState = 'ready';
            }, 2000);
        },

        measurePhotons: function() {
            if (this.experimentState !== 'ready') return;
            this.experimentState = 'measuring';
            
            // Анимация измерения
            setTimeout(() => {
                this.experimentState = 'measured';
                this.updateStats();
            }, 1000);
        },

        updateStats: function() {
            this.totalTests++;
            this.correlatedTests++;
            const correlation = Math.round((this.correlatedTests / this.totalTests) * 100);
            
            const correlationElement = document.getElementById('correlation');
            if (correlationElement) {
                correlationElement.textContent = correlation + '%';
            }
        }
    }
};

// Инициализация экспериментов при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Определяем, какой эксперимент нужно инициализировать
    if (document.getElementById('double-slit-experiment')) {
        experiments.doubleSlit.init();
    }
    if (document.getElementById('entanglement-experiment')) {
        experiments.entanglement.init();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Элементы эксперимента
    const particle = document.querySelector('.quantum-particle');
    const observer = document.querySelector('.observer');
    const result = document.querySelector('.measurement-result');
    const startBtn = document.getElementById('start-observation');
    const stopBtn = document.getElementById('stop-observation');
    const resetBtn = document.getElementById('reset-experiment');
    const totalMeasurements = document.getElementById('total-measurements');
    const probability = document.getElementById('probability');

    let isObserving = false;
    let measurements = 0;
    let superposition = true;
    let observationInterval;

    // Функция для обновления состояния частицы
    function updateParticleState() {
        if (isObserving) {
            // При наблюдении частица коллапсирует в одно из состояний
            const state = Math.random() < 0.5 ? 'spin-up' : 'spin-down';
            particle.className = 'quantum-particle ' + state;
            result.textContent = `Состояние: ${state === 'spin-up' ? 'Спин вверх ↑' : 'Спин вниз ↓'}`;
            measurements++;
            totalMeasurements.textContent = measurements;
            probability.textContent = `${Math.round((measurements / 2) * 100)}%`;
        } else {
            // В суперпозиции частица находится в обоих состояниях
            particle.className = 'quantum-particle superposition';
            result.textContent = 'Состояние: Суперпозиция';
        }
    }

    // Обработчики событий
    startBtn.addEventListener('click', function() {
        isObserving = true;
        observer.style.opacity = '1';
        updateParticleState();
        observationInterval = setInterval(updateParticleState, 2000);
    });

    stopBtn.addEventListener('click', function() {
        isObserving = false;
        observer.style.opacity = '0.3';
        clearInterval(observationInterval);
        updateParticleState();
    });

    resetBtn.addEventListener('click', function() {
        isObserving = false;
        measurements = 0;
        observer.style.opacity = '0.3';
        clearInterval(observationInterval);
        totalMeasurements.textContent = '0';
        probability.textContent = '50%';
        updateParticleState();
    });

    // Инициализация
    updateParticleState();
}); 