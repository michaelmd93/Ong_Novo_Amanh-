// Dashboard - Integração com Backend MySQL
const API_BASE_URL = 'http://localhost:3003/api';

// Elementos do DOM
let totalAlunosElement, totalProfessoresElement, totalCursosElement;
let chartAlunos, chartPresenca;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
});

function initializeDashboard() {
    // Elementos de estatísticas
    totalAlunosElement = document.getElementById('totalAlunos');
    totalProfessoresElement = document.getElementById('totalProfessores');
    totalCursosElement = document.getElementById('totalCursos');
    
    // Verificar se os elementos existem
    if (!totalAlunosElement || !totalProfessoresElement || !totalCursosElement) {
        console.warn('Alguns elementos de estatísticas não foram encontrados no DOM');
    }
}

async function loadDashboardData() {
    try {
        // Carregar estatísticas em paralelo
        const [alunosData, professoresData, cursosData] = await Promise.all([
            fetchAlunos(),
            fetchProfessores(),
            fetchCursos()
        ]);

        // Atualizar contadores
        updateCounters(alunosData, professoresData, cursosData);
        
        // Atualizar gráficos se existirem
        updateCharts(alunosData);
        
        console.log('Dashboard carregado com sucesso');
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showError('Erro ao carregar dados do dashboard');
    }
}

async function fetchAlunos() {
    try {
        const response = await fetch(`${API_BASE_URL}/alunos`);
        if (!response.ok) throw new Error('Erro ao buscar alunos');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        return [];
    }
}

async function fetchProfessores() {
    try {
        const response = await fetch(`${API_BASE_URL}/professores`);
        if (!response.ok) throw new Error('Erro ao buscar professores');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        return [];
    }
}

async function fetchCursos() {
    try {
        const response = await fetch(`${API_BASE_URL}/cursos`);
        if (!response.ok) throw new Error('Erro ao buscar cursos');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        return [];
    }
}

function updateCounters(alunos, professores, cursos) {
    // Atualizar contador de alunos
    if (totalAlunosElement) {
        const totalAlunos = Array.isArray(alunos) ? alunos.length : 0;
        totalAlunosElement.textContent = totalAlunos;
        animateCounter(totalAlunosElement, totalAlunos);
    }

    // Atualizar contador de professores
    if (totalProfessoresElement) {
        const totalProfessores = Array.isArray(professores) ? professores.length : 0;
        totalProfessoresElement.textContent = totalProfessores;
        animateCounter(totalProfessoresElement, totalProfessores);
    }

    // Atualizar contador de cursos
    if (totalCursosElement) {
        const totalCursos = Array.isArray(cursos) ? cursos.length : 0;
        totalCursosElement.textContent = totalCursos;
        animateCounter(totalCursosElement, totalCursos);
    }
}

function animateCounter(element, finalValue) {
    let currentValue = 0;
    const increment = Math.ceil(finalValue / 20);
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(timer);
        }
        element.textContent = currentValue;
    }, 50);
}

function updateCharts(alunos) {
    // Atualizar gráfico de alunos por turma (se existir)
    updateAlunosPorTurmaChart(alunos);
    
    // Atualizar gráfico de presença (simulado por enquanto)
    updatePresencaChart();
}

function updateAlunosPorTurmaChart(alunos) {
    const chartElement = document.getElementById('chartAlunos');
    if (!chartElement) return;

    // Contar alunos por turma
    const turmas = {};
    alunos.forEach(aluno => {
        const turma = aluno.turma || 'Sem turma';
        turmas[turma] = (turmas[turma] || 0) + 1;
    });

    // Criar dados para o gráfico
    const labels = Object.keys(turmas);
    const data = Object.values(turmas);

    // Se Chart.js estiver disponível, criar gráfico
    if (typeof Chart !== 'undefined') {
        if (chartAlunos) {
            chartAlunos.destroy();
        }
        
        chartAlunos = new Chart(chartElement, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function updatePresencaChart() {
    const chartElement = document.getElementById('chartPresenca');
    if (!chartElement || typeof Chart === 'undefined') return;

    // Dados simulados de presença
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const data = [85, 92, 78, 88, 95];

    if (chartPresenca) {
        chartPresenca.destroy();
    }

    chartPresenca = new Chart(chartElement, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Presença (%)',
                data: data,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function showError(message) {
    // Criar toast de erro
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Adicionar ao container de toasts ou body
    const toastContainer = document.querySelector('.toast-container') || document.body;
    toastContainer.appendChild(toast);
    
    // Mostrar toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover após 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Função para recarregar dados
function refreshDashboard() {
    loadDashboardData();
}

// Atualizar dados a cada 5 minutos
setInterval(refreshDashboard, 300000);