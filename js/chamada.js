// Dados mockados para desenvolvimento do frontend
const mockData = {
    professores: [
        { id: 'prof1', nome: 'Ana Silva', area: 'Matemática' },
        { id: 'prof2', nome: 'Carlos Santos', area: 'Português' },
        { id: 'prof3', nome: 'Mariana Oliveira', area: 'História' },
        { id: 'prof4', nome: 'Roberto Almeida', area: 'Geografia' },
        { id: 'prof5', nome: 'Patricia Costa', area: 'Ciências' }
    ],
    alunos: [
        { id: 'aluno1', nome: 'João Silva', matricula: '2023001' },
        { id: 'aluno2', nome: 'Maria Santos', matricula: '2023002' },
        { id: 'aluno3', nome: 'Pedro Oliveira', matricula: '2023003' }
    ],
    salas: []
};

// Elementos do DOM
const searchSalas = document.getElementById('searchSalas');
const listaSalas = document.getElementById('listaSalas');
const formCriarSala = document.getElementById('formCriarSala');
const btnSalvarSala = document.getElementById('btnSalvarSala');

// Estado da aplicação
let dadosSalaNova = null;
let alunosSelecionados = new Set();

// Modais
const modalCriarSala = new bootstrap.Modal(document.getElementById('modalCriarSala'));
const modalSelecionarAlunos = new bootstrap.Modal(document.getElementById('modalSelecionarAlunos'));

// Dados temporários
let dadosSalaNova = null;
let alunosSelecionados = new Set();

// Funções de utilidade
const utils = {
    showFeedback(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    },
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    },
    
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Funções de gerenciamento de dados
const dataManager = {
    carregarProfessores() {
        const professorSelect = document.getElementById('professorSala');
        if (!professorSelect) return;

        try {
            professorSelect.innerHTML = '<option value="">Selecione um professor</option>';

            mockData.professores.forEach(professor => {
                const option = document.createElement('option');
                option.value = professor.id;
                option.textContent = `${professor.nome} (${professor.area})`;
                professorSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            utils.showFeedback('Erro ao carregar lista de professores', 'danger');
        }
    },

    carregarAlunos() {
        const listaAlunos = document.getElementById('listaAlunos');
        if (!listaAlunos) return;

        try {
            listaAlunos.innerHTML = '';
            
            mockData.alunos.forEach(aluno => {
                const div = document.createElement('div');
                div.className = 'list-group-item';
                div.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${aluno.id}" id="aluno_${aluno.id}">
                        <label class="form-check-label" for="aluno_${aluno.id}">
                            ${aluno.nome}
                            <small class="text-muted ms-2">${aluno.matricula || 'Sem matrícula'}</small>
                        </label>
                    </div>
                `;
                
                const checkbox = div.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        alunosSelecionados.add(aluno.id);
                    } else {
                        alunosSelecionados.delete(aluno.id);
                    }
                });
                
                listaAlunos.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            utils.showFeedback('Erro ao carregar alunos', 'danger');
        }
    },

    salvarSala(dadosSala) {
        try {
            const novaSala = {
                id: utils.generateId(),
                ...dadosSala,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };

            mockData.salas.push(novaSala);
            return novaSala;
        } catch (error) {
            console.error('Erro ao salvar sala:', error);
            throw error;
        }
    },

    atualizarSala(salaId, dadosAtualizados) {
        try {
            const index = mockData.salas.findIndex(sala => sala.id === salaId);
            if (index === -1) throw new Error('Sala não encontrada');

            mockData.salas[index] = {
                ...mockData.salas[index],
                ...dadosAtualizados,
                atualizadoEm: new Date().toISOString()
            };

            return mockData.salas[index];
        } catch (error) {
            console.error('Erro ao atualizar sala:', error);
            throw error;
        }
    },

    excluirSala(salaId) {
        try {
            const index = mockData.salas.findIndex(sala => sala.id === salaId);
            if (index === -1) throw new Error('Sala não encontrada');

            mockData.salas.splice(index, 1);
        } catch (error) {
            console.error('Erro ao excluir sala:', error);
            throw error;
        }
    }
};

// Carregar professores
async function carregarProfessoresTeste() {
    try {
        const professoresTeste = [
            { id: 'prof1', nome: 'Ana Silva', area: 'Matemática' },
            { id: 'prof2', nome: 'Carlos Santos', area: 'Português' },
            { id: 'prof3', nome: 'Mariana Oliveira', area: 'História' },
            { id: 'prof4', nome: 'Roberto Almeida', area: 'Geografia' },
            { id: 'prof5', nome: 'Patricia Costa', area: 'Ciências' },
            { id: 'prof6', nome: 'João Pedro', area: 'Educação Física' },
            { id: 'prof7', nome: 'Beatriz Lima', area: 'Artes' },
            { id: 'prof8', nome: 'Ricardo Souza', area: 'Inglês' },
            { id: 'prof9', nome: 'Fernanda Martins', area: 'Música' },
            { id: 'prof10', nome: 'Lucas Pereira', area: 'Informática' }
        ];

        const selectProfessor = document.getElementById('professorSala');
        
        // Limpar opções existentes
        selectProfessor.innerHTML = '<option value="">Selecione um professor</option>';
        
        professoresTeste.forEach((professor) => {
            const option = document.createElement('option');
            option.value = professor.id;
            option.textContent = `${professor.nome} (${professor.area})`;
            selectProfessor.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        showFeedback('Erro ao carregar professores', 'danger');
    }
}

// Carregar professores no select
async function carregarProfessoresSelect() {
    try {
        const professorSelect = document.getElementById('professorResponsavel');
        const q = query(collection(db, 'usuarios'), where('tipo', '==', 'professor'));
        const querySnapshot = await getDocs(q);
        
        professorSelect.innerHTML = '<option value="" selected disabled>Selecione um professor</option>';
        
        querySnapshot.forEach((doc) => {
            const professor = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = professor.nome;
            professorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        showFeedback('Erro ao carregar professores', 'danger');
    }
}

// Carregar alunos ativos
async function carregarAlunos() {
    try {
        const listaAlunos = document.getElementById('listaAlunos');
        const q = query(collection(db, 'alunos'), where('status', '==', 'ativo'));
        const querySnapshot = await getDocs(q);
        
        listaAlunos.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const aluno = doc.data();
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${doc.id}" id="aluno_${doc.id}">
                    <label class="form-check-label" for="aluno_${doc.id}">
                        ${aluno.nome}
                        <small class="text-muted ms-2">${aluno.matricula || 'Sem matrícula'}</small>
                    </label>
                </div>
            `;
            
            const checkbox = div.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    alunosSelecionados.add(doc.id);
                } else {
                    alunosSelecionados.delete(doc.id);
                }
            });
            
            listaAlunos.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        showFeedback('Erro ao carregar alunos', 'danger');
    }
}

// Funções de renderização
const renderer = {
    renderSalas() {
        const listaSalas = document.getElementById('listaSalas');
        if (!listaSalas) return;

        const salas = mockData.salas;
        listaSalas.innerHTML = '';

        if (salas.length === 0) {
            listaSalas.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        Nenhuma sala encontrada
                    </div>
                </div>
            `;
            return;
        }

        salas.forEach(sala => {
            const professor = mockData.professores.find(p => p.id === sala.professorId) || { nome: 'Professor não encontrado' };
            const numAlunos = sala.alunos ? sala.alunos.length : 0;
            
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            
            card.innerHTML = `
                <div class="card h-100 shadow-hover border-0" style="cursor: pointer" onclick="window.location.href='sala.html?id=${sala.id}'">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="mb-3">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <div class="badge bg-primary-subtle text-primary">
                                        <i class="bi bi-book"></i>
                                        ${sala.oficina}
                                    </div>
                                    <div class="badge bg-success-subtle text-success">
                                        <i class="bi bi-people"></i>
                                        ${numAlunos} aluno${numAlunos === 1 ? '' : 's'}
                                    </div>
                                </div>
                                <h5 class="card-title mb-0">${sala.nome}</h5>
                            </div>
                            <div class="dropdown" onclick="event.stopPropagation()">
                                <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                    <li>
                                        <button class="dropdown-item" onclick="app.editarSala('${sala.id}')">
                                            <i class="bi bi-pencil me-2"></i>
                                            Editar
                                        </button>
                                    </li>
                                    <li>
                                        <button class="dropdown-item text-danger" onclick="app.excluirSala('${sala.id}')">
                                            <i class="bi bi-trash me-2"></i>
                                            Excluir
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="d-flex align-items-center text-muted mb-2">
                                <i class="bi bi-person me-2"></i>
                                ${professor.nome}
                            </div>
                            <div class="d-flex align-items-center text-muted mb-2">
                                <i class="bi bi-calendar3 me-2"></i>
                                ${sala.diasSemana.join(', ')}
                            </div>
                            <div class="d-flex align-items-center text-muted">
                                <i class="bi bi-clock me-2"></i>
                                ${sala.horario || 'Horário não definido'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            listaSalas.appendChild(card);
        });
    }
};

// Carregar todas as salas
async function carregarSalas() {
    try {
        const querySnapshot = await getDocs(collection(db, 'salas'));
        const salas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSalas(salas);
    } catch (error) {
        console.error('Erro ao carregar salas:', error);
        showFeedback('Erro ao carregar salas', 'danger');
    }
}

// Pesquisar salas
searchSalas.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = listaSalas.getElementsByClassName('col-md-6');
    
    Array.from(cards).forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Próximo passo do cadastro
btnProximoPasso.addEventListener('click', () => {
    if (!formCriarSala.checkValidity()) {
        formCriarSala.reportValidity();
        return;
    }
    

// Voltar para o primeiro passo
btnVoltarPasso.addEventListener('click', () => {
    modalSelecionarAlunos.hide();
    modalCriarSala.show();
});

// Salvar sala completa
btnSalvarSala.addEventListener('click', async () => {
    try {
        dadosSalaNova.alunos = Array.from(alunosSelecionados);
        
        const docRef = await addDoc(collection(db, 'salas'), dadosSalaNova);
        
        modalSelecionarAlunos.hide();
        formCriarSala.reset();
        alunosSelecionados.clear();
        dadosSalaNova = null;
        
        showFeedback('Sala criada com sucesso!');
        carregarSalas();
    } catch (error) {
        console.error('Erro ao criar sala:', error);

// Editar sala
async function editarSala(salaId) {
    try {
        const salaRef = doc(db, 'salas', salaId);
        const salaDoc = await getDoc(salaRef);
        
        if (!salaDoc.exists()) {
            showFeedback('Sala não encontrada', 'danger');
            return;
        }
        
        const sala = salaDoc.data();
        
        // Preencher formulário
        document.getElementById('nomeSala').value = sala.nome;
        document.getElementById('professorSala').value = sala.professorId;
        document.getElementById('oficinaSala').value = sala.oficina;
        document.getElementById('horarioSala').value = sala.horario || '';
        
        // Marcar dias da semana
        document.querySelectorAll('input[name="diasSemana"]').forEach(checkbox => {
            checkbox.checked = sala.diasSemana.includes(checkbox.value);
        });
        
        // Configurar botão de salvar
        const btnSalvar = document.getElementById('btnSalvarSala');
        btnSalvar.onclick = async () => {
            const nome = document.getElementById('nomeSala').value;
            const professorId = document.getElementById('professorSala').value;
            const professorNome = document.getElementById('professorSala').options[document.getElementById('professorSala').selectedIndex].text;
            const oficina = document.getElementById('oficinaSala').value;
            const horario = document.getElementById('horarioSala').value;
            
            // Pegar dias selecionados
            const diasSemana = [];
            document.querySelectorAll('input[name="diasSemana"]:checked').forEach(checkbox => {
                diasSemana.push(checkbox.value);
            });
            
            if (!nome || !professorId || !oficina || !horario || diasSemana.length === 0) {
                showFeedback('Preencha todos os campos obrigatórios', 'danger');
                return;
            }
            
            try {
                await updateDoc(salaRef, {
                    nome,
                    professorId,
                    professorNome,
                    oficina,
                    horario,
                    diasSemana,
                    atualizadoEm: new Date().toISOString(),
                    atualizadoPor: currentUser.uid
                });
                
                showFeedback('Sala atualizada com sucesso!');
                modalCriarSala.hide();
                
                // Recarregar lista de salas
                await carregarSalas();
                
            } catch (error) {
                console.error('Erro ao atualizar sala:', error);
                showFeedback('Erro ao atualizar sala', 'danger');
            }
        };
        
        modalCriarSala.show();
        
    } catch (error) {
        console.error('Erro ao editar sala:', error);
        showFeedback('Erro ao editar sala', 'danger');
    }
}

// Excluir sala
async function excluirSala(salaId) {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
        try {
            await deleteDoc(doc(db, 'salas', salaId));
            showFeedback('Sala excluída com sucesso!');
            await carregarSalas();
        } catch (error) {
            console.error('Erro ao excluir sala:', error);
            showFeedback('Erro ao excluir sala', 'danger');
        }
    }
}

// Função de logout
function handleLogout() {
    auth.signOut().then(() => {
        localStorage.clear(); // Limpar dados locais
        sessionStorage.clear(); // Limpar dados da sessão
        window.location.href = '../index.html';
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
        showFeedback('Erro ao fazer logout', 'danger');
    });
}

// Objeto principal da aplicação
const app = {
    async init() {
        // Carregar dados iniciais
        await dataManager.carregarProfessores();
        await dataManager.carregarAlunos();
        renderer.renderSalas();

        // Configurar eventos
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Pesquisa de salas
        const searchSalas = document.getElementById('searchSalas');
        if (searchSalas) {
            searchSalas.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('#listaSalas .col-md-6');
                
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // Formulário de criar sala
        const formCriarSala = document.getElementById('formCriarSala');
        if (formCriarSala) {
            formCriarSala.addEventListener('submit', this.handleSalvarSala.bind(this));
        }
    },

    async handleSalvarSala(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const sala = {
                nome: formData.get('nomeSala'),
                professorId: formData.get('professorSala'),
                oficina: formData.get('oficinaSala'),
                horario: formData.get('horarioSala'),
                diasSemana: [...formData.getAll('diasSemana')],
                alunos: [...alunosSelecionados]
            };

            await dataManager.salvarSala(sala);
            utils.showFeedback('Sala criada com sucesso!');
            modalCriarSala.hide();
            renderer.renderSalas();
            e.target.reset();
            alunosSelecionados.clear();
        } catch (error) {
            console.error('Erro ao salvar sala:', error);
            utils.showFeedback('Erro ao criar sala', 'danger');
        }
    },

    async editarSala(salaId) {
        try {
            const sala = mockData.salas.find(s => s.id === salaId);
            if (!sala) throw new Error('Sala não encontrada');

            // Preencher formulário
            document.getElementById('nomeSala').value = sala.nome;
            document.getElementById('professorSala').value = sala.professorId;
            document.getElementById('oficinaSala').value = sala.oficina;
            document.getElementById('horarioSala').value = sala.horario || '';

            document.querySelectorAll('input[name="diasSemana"]').forEach(checkbox => {
                checkbox.checked = sala.diasSemana.includes(checkbox.value);
            });

            modalCriarSala.show();
        } catch (error) {
            console.error('Erro ao editar sala:', error);
            utils.showFeedback('Erro ao carregar dados da sala', 'danger');
        }
    },

    async excluirSala(salaId) {
        if (!confirm('Tem certeza que deseja excluir esta sala?')) return;

        try {
            await dataManager.excluirSala(salaId);
            utils.showFeedback('Sala excluída com sucesso!');
            renderer.renderSalas();
        } catch (error) {
            console.error('Erro ao excluir sala:', error);
            utils.showFeedback('Erro ao excluir sala', 'danger');
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }

    // Verificar se o usuário está autenticado
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            carregarSalas();
            carregarProfessores();
            carregarAlunos();
        } else {
            window.location.href = '../index.html';
        }
    });
});
