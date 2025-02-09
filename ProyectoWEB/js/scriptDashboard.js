document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get('id') || '1';

    fetch(`http://localhost:3000/salespersons/${sellerId}`)
        .then(response => response.json())
        .then(data => {
            const info = data.infoResult.data[0];
            const weeks = data.weekResult.data;
            const devolutionsPercentage =(info.invoices === 0 ? 100 : (info.creditNotes / info.invoices) * 100).toFixed(2) ;
            document.getElementById("devolutionsPercentage").textContent= `${devolutionsPercentage}%` ;
            
            document.getElementById('sellerName').textContent = info.slpName;
            document.getElementById('currentSale').textContent = formatCurrency(info.sale);
            document.getElementById('currentTarget').textContent = formatCurrency(info.budget);
            document.getElementById('difference').textContent = formatCurrency(info.sale - info.budget);
            document.getElementById('compliancePercentage').textContent = `${info.budget > 0 ? ((info.sale / info.budget) * 100).toFixed(2) : 0}%`;
            
            projectedSales = ((data.infoResult.data[0].sale / 100) * data.infoResult.data[0].monthAdvance);
            projectedPercentage = ((projectedSales / data.infoResult.data[0].budget) * 100).toFixed(2);

            const projection = projectedPercentage;
            document.getElementById('projectionPercentage').textContent = `${projection}%`;
            document.getElementById('projectionAmount').textContent = formatCurrency(projectedSales.toFixed(2));
            
            document.getElementById('openOrdersMetric').textContent = formatCurrency(info.salesOrders);
            document.getElementById('openQuotationsMetric').textContent = formatCurrency(info.quotations);
            document.getElementById('annualSale').textContent = formatCurrency(info.yearSale);
            document.getElementById('annualTarget').textContent = formatCurrency(info.yearBudget);
            document.getElementById('annualCompliance').textContent = 
                `${((info.yearSale / info.yearBudget) * 100).toFixed(1)}%`;
            document.getElementById('salesMetric').textContent = formatCurrency(info.invoices);
            document.getElementById('returnsMetric').textContent = formatCurrency(info.creditNotes);
            
            createWeeklyChart(weeks, info);
            createComplianceChart(info.monthAdvance);
            createProjectionChart(projection);
        })
        .catch(error => {
            console.error('Error:', error);
            document.body.innerHTML = '<h2 class="text-center">Error al cargar los datos</h2>';
        });
});

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function calculateProjection(currentSale, budget, monthAdvance) {
    projectedSales = ((data.infoResult.data[0].sale / 100) * data.infoResult.data[0].monthAdvance);
    projectedPercentage = ((projectedSales / data.infoResult.data[0].budget) * 100).toFixed(2);
    return projectedPercentage;
}

function createWeeklyChart(weeks, info) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    // Etiquetas para las semanas
    const weekLabels = weeks.map(w => `Semana ${w.week}`);

    // Calcular ventas acumuladas
    let accumulatedSales = 0;
    const weekSales = weeks.map(w => {
        accumulatedSales += w.sale;
        return accumulatedSales / 1000000;
    });

    // Calcular metas acumuladas
    let accumulatedWeight = 0;
    const weekBudgets = weeks.map(w => {
        if (w.weekWeight > 0) {
            accumulatedWeight += w.weekWeight;
        }
        return (accumulatedWeight * info.budget) / 100 / 1000000;
    });

    // Calcular acumulados del mes anterior
    let accumulatedPastMonthSale = 0;
    const pastMonthAvg = weeks.map(w => {
        if (w.weekWeight > 0) {
            accumulatedPastMonthSale += (info.pastMonthSale * w.weekWeight) / 100;
        }
        return accumulatedPastMonthSale / 1000000;
    });

    // Calcular acumulados del año anterior
    let accumulatedPastYearSale = 0;
    const pastYearAvg = weeks.map(w => {
        if (w.weekWeight > 0) {
            accumulatedPastYearSale += (info.pastYearSale * w.weekWeight) / 100;
        }
        return accumulatedPastYearSale / 1000000;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [
                {
                    label: 'Meta acumulada',
                    data: weekBudgets,
                    backgroundColor: '#ff5b5b'
                },
                {
                    label: 'Venta acumulada',
                    data: weekSales,
                    backgroundColor: '#2ecc71'
                },
                {
                    label: 'Año anterior acumulado',
                    data: pastYearAvg,
                    backgroundColor: '#666'
                },
                {
                    label: 'Mes anterior acumulado',
                    data: pastMonthAvg,
                    backgroundColor: '#999'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(1) + 'M';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 8
                    }
                }
            }
        }
    });
}

function createComplianceChart(compliance) {
    const ctx = document.getElementById('complianceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [compliance, 100 - compliance],
                backgroundColor: ['#2ecc71', '#f5f5f5'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createProjectionChart(projection) {
    const ctx = document.getElementById('projectionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [projection, 100 - projection],
                backgroundColor: ['white', 'rgba(255,255,255,0.2)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}