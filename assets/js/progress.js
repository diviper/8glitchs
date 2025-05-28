document.addEventListener('DOMContentLoaded', function() {
    // Инициализация прогресса
    const progressBar = document.querySelector('.progress-bar');
    const progressCount = document.getElementById('progress-count');
    const anomalyCards = document.querySelectorAll('.promise-card');
    
    // Загрузка сохраненного прогресса
    let visitedAnomalies = JSON.parse(localStorage.getItem('visitedAnomalies')) || [];
    
    // Обновление прогресса
    function updateProgress() {
        const total = anomalyCards.length;
        const visited = visitedAnomalies.length;
        const percentage = (visited / total) * 100;
        
        progressBar.style.width = `${percentage}%`;
        progressCount.textContent = visited;
        
        // Обновление карточек
        anomalyCards.forEach(card => {
            const anomalyId = card.dataset.anomaly;
            const cardProgress = card.querySelector('.card-progress');
            
            if (visitedAnomalies.includes(anomalyId)) {
                card.classList.add('visited');
                cardProgress.style.width = '100%';
            } else {
                card.classList.remove('visited');
                cardProgress.style.width = '0%';
            }
        });
    }
    
    // Обработка клика по карточке
    anomalyCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const anomalyId = this.dataset.anomaly;
            if (!visitedAnomalies.includes(anomalyId)) {
                visitedAnomalies.push(anomalyId);
                localStorage.setItem('visitedAnomalies', JSON.stringify(visitedAnomalies));
                updateProgress();
            }
        });
    });
    
    // Инициализация
    updateProgress();
}); 