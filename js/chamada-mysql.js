// Chamada - Integração com Backend MySQL
const API_BASE_URL = 'http://localhost:3003/api';

// Variáveis globais
let professores = [];
let alunos = [];
let cursos = [];
let salas = [];
let alunosSelecionados = new Set();

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadData();
});

function initializePage() {
    // Event listeners
    document.getElementById('searchSalas').addEventListener('input', filtrarSalas);
    document.getElementById('searchAlunos').addEventListener('input', filtrarAlunos);
    document.getElementById('btnSalvarSala').addEventListener('click', salvarSala);
    
    // Modal events
    document.getElementById('modalCriarSala').addEventListener('hidden.bs.modal', limparFormulario);
}

async function loadData() {
    try {
        showLoading(true);
        
        // Carregar dados em paralelo
        const [professoresData, alunosData, cursosData] = await Promise.all([
            fetchProfessores(),
            fetchAlunos(),
            fetchCursos()
        ]);
        
        professores = professoresData;
        alunos = alunosData;
        cursos = cursosData;
        
        // Atualizar interface
        loadProfessoresSelect();
        renderSalas();
        
        console.log('Dados carregados:', professores.length, 'professores,', alunos.length, 'alunos');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados', 'error');
    } finally {
        showLoading(false);
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

function loadProfessoresSelect() {
    const select = document.getElementById('professorSala');
    select.innerHTML = '<option value="">Selecione um professor</option>';
    
    professores.forEach(professor => {
        if (professor.status === 'ativo') {
            const option = document.createElement('option');
            option.value = professor.id;
            option.textContent = `${professor.nome} - ${professor.especialidade || 'Sem especialidade'}`;
            select.appendChild(option);
        }
    });
}

function renderSalas() {
    const container = document.getElementById('listaSalas');
    
    if (salas.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-door-open fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted">Nenhuma sala cadastrada</h5>
                    <p class="text-muted">Clique em "Nova Sala" para começar</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    salas.forEach(sala => {
        const professor = professores.find(p => p.id === sala.professor_id);
        const professorNome = professor ? professor.nome : 'Professor não encontrado';
        
        const salaCard = `
            <div class="col-md-6 col-lg-4">
                <div class="card sala-card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">${sala.nome}</h5>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="fazerChamada(${sala.id})">
                                        <i class="bi bi-check-circle me-2"></i>Fazer Chamada
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="verPresencas(${sala.id})">
                                        <i class="bi bi-list-check me-2"></i>Ver Presenças
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="excluirSala(${sala.id})">
                                        <i class="bi bi-trash me-2"></i>Excluir
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <p class="card-text mb-1">
                                <i class="bi bi-person me-2 text-primary"></i>
                                <strong>Professor:</strong> ${professorNome}
                            </p>
                            <p class="card-text mb-1">
                                <i class="bi bi-book me-2 text-success"></i>
                                <strong>Oficina:</strong> ${sala.oficina}
                            </p>
                            <p class="card-text mb-1">
                                <i class="bi bi-clock me-2 text-info"></i>
                                <strong>Horário:</strong> ${sala.horario}
                            </p>
                            <p class="card-text mb-0">
                                <i class="bi bi-calendar3 me-2 text-warning"></i>
                                <strong>Dias:</strong> ${sala.dias_semana}
                            </p>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="bi bi-people me-1"></i>
                                ${sala.total_alunos || 0} alunos
                            </small>
                            <button class="btn btn-primary btn-sm" onclick="fazerChamada(${sala.id})">
                                <i class="bi bi-check-circle me-1"></i>
                                Chamada
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += salaCard;
    });
}

async function salvarSala() {
    try {
        const formData = getSalaFormData();
        
        if (!validateSalaForm(formData)) return;
        
        showLoading(true);
        
        // Simular salvamento (implementar endpoint no backend)
        const novaSala = {
            id: Date.now(), // Temporário
            ...formData,
            total_alunos: alunosSelecionados.size
        };
        
        salas.push(novaSala);
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCriarSala'));
        modal.hide();
        
        // Atualizar interface
        renderSalas();
        
        showToast('Sala criada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar sala:', error);
        showToast('Erro ao salvar sala: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function getSalaFormData() {
    const diasSelecionados = [];
    document.querySelectorAll('input[name="diasSemana"]:checked').forEach(checkbox => {
        diasSelecionados.push(checkbox.value);
    });
    
    return {
        nome: document.getElementById('nomeSala').value.trim(),
        professor_id: parseInt(document.getElementById('professorSala').value),
        oficina: document.getElementById('oficinaSala').value.trim(),
        horario: document.getElementById('horarioSala').value,
        dias_semana: diasSelecionados.join(', ')
    };
}

function validateSalaForm(data) {
    if (!data.nome) {
        showToast('Nome da sala é obrigatório', 'error');
        document.getElementById('nomeSala').focus();
        return false;
    }
    
    if (!data.professor_id) {
        showToast('Selecione um professor', 'error');
        document.getElementById('professorSala').focus();
        return false;
    }
    
    if (!data.oficina) {
        showToast('Nome da oficina é obrigatório', 'error');
        document.getElementById('oficinaSala').focus();
        return false;
    }
    
    if (!data.horario) {
        showToast('Horário é obrigatório', 'error');
        document.getElementById('horarioSala').focus();
        return false;
    }
    
    if (!data.dias_semana) {
        showToast('Selecione pelo menos um dia da semana', 'error');
        return false;
    }
    
    return true;
}

function fazerChamada(salaId) {
    const sala = salas.find(s => s.id === salaId);
    if (!sala) {
        showToast('Sala não encontrada', 'error');
        return;
    }
    
    // Implementar modal de chamada
    showToast('Funcionalidade de chamada em desenvolvimento', 'info');
}

function verPresencas(salaId) {
    const sala = salas.find(s => s.id === salaId);
    if (!sala) {
        showToast('Sala não encontrada', 'error');
        return;
    }
    
    // Implementar visualização de presenças
    showToast('Funcionalidade de visualização de presenças em desenvolvimento', 'info');
}

function excluirSala(salaId) {
    const sala = salas.find(s => s.id === salaId);
    if (!sala) {
        showToast('Sala não encontrada', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir a sala "${sala.nome}"?`)) {
        return;
    }
    
    // Remover da lista
    salas = salas.filter(s => s.id !== salaId);
    
    // Atualizar interface
    renderSalas();
    
    showToast('Sala excluída com sucesso!', 'success');
}

function filtrarSalas() {
    const termo = document.getElementById('searchSalas').value.toLowerCase();
    const cards = document.querySelectorAll('.sala-card');
    
    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        const container = card.closest('.col-md-6, .col-lg-4');
        
        if (texto.includes(termo)) {
            container.style.display = '';
        } else {
            container.style.display = 'none';
        }
    });
}

function filtrarAlunos() {
    const termo = document.getElementById('searchAlunos').value.toLowerCase();
    const items = document.querySelectorAll('#listaAlunos .list-group-item');
    
    items.forEach(item => {
        const texto = item.textContent.toLowerCase();
        
        if (texto.includes(termo)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function limparFormulario() {
    document.getElementById('nomeSala').value = '';
    document.getElementById('professorSala').value = '';
    document.getElementById('oficinaSala').value = '';
    document.getElementById('horarioSala').value = '';
    
    // Desmarcar checkboxes
    document.querySelectorAll('input[name="diasSemana"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    alunosSelecionados.clear();
}

function showLoading(show) {
    const btn = document.getElementById('btnSalvarSala');
    if (show) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Salvar';
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white ${bgClass} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}
