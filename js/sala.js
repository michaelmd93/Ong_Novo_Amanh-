// Importações do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC2kk-BUzK4qCzHe6vgI3eMm3YHzKiF2ew",
    authDomain: "projeto-integrador-389fb.firebaseapp.com",
    projectId: "projeto-integrador-389fb",
    storageBucket: "projeto-integrador-389fb.appspot.com",
    messagingSenderId: "754376206685",
    appId: "1:754376206685:web:a3ded0f884cc5c32b7e436"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variáveis globais
let currentUser = null;
let salaId = null;
let sala = null;

// Elementos do DOM
const nomeSala = document.getElementById('nomeSala');
const professorSala = document.getElementById('professorSala');
const oficinaSala = document.getElementById('oficinaSala');
const diasSemana = document.getElementById('diasSemana');
const horarioSala = document.getElementById('horarioSala');
const listaAlunos = document.getElementById('listaAlunos');
const timelinePresencas = document.getElementById('timelinePresencas');
const tabelaPresenca = document.getElementById('tabelaPresenca');
const btnSalvarPresenca = document.getElementById('btnSalvarPresenca');
const btnConfirmarAlteracao = document.getElementById('btnConfirmarAlteracao');
const motivoAlteracao = document.getElementById('motivoAlteracao');

// Modais
const modalRegistrarPresenca = new bootstrap.Modal(document.getElementById('modalRegistrarPresenca'));
const modalConfirmarAlteracao = new bootstrap.Modal(document.getElementById('modalConfirmarAlteracao'));

// Função para mostrar feedback
function showFeedback(message, type = 'success') {
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
    
    // Som de feedback
    if (type === 'success') {
        const audio = new Audio('../assets/sounds/success.mp3');
        audio.play();
    }
    
    // Remover o toast após ser ocultado
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}

// Carregar dados da sala
async function carregarSala() {
    try {
        // Pegar ID da sala da URL
        const urlParams = new URLSearchParams(window.location.search);
        const salaId = urlParams.get('id');
        
        if (!salaId) {
            window.location.href = 'chamada.html';
            return;
        }
        
        currentSala = salaId;
        
        // Buscar dados da sala
        const salaRef = doc(db, 'salas', salaId);
        const salaDoc = await getDoc(salaRef);
        
        if (!salaDoc.exists()) {
            showFeedback('Sala não encontrada', 'danger');
            setTimeout(() => window.location.href = 'chamada.html', 2000);
            return;
        }
        
        salaData = salaDoc.data();
        
        // Atualizar interface
        nomeSala.textContent = salaData.nome;
        document.getElementById('professorSala').textContent = salaData.professorNome;
        document.getElementById('oficinaSala').textContent = salaData.oficina;
        document.getElementById('diasSemana').textContent = salaData.diasSemana.join(', ');
        document.getElementById('horarioSala').textContent = salaData.horario || 'Horário não definido';
        
        // Carregar alunos
        await carregarAlunos();
        
        // Carregar timeline
        await carregarTimeline();
        
        // Definir data atual no input
        dataPresenca.value = new Date().toISOString().split('T')[0];
        
    } catch (error) {
        console.error('Erro ao carregar sala:', error);
        showFeedback('Erro ao carregar sala', 'danger');
    }
}

// Carregar alunos da sala
async function carregarAlunos() {
    try {
        listaAlunos.innerHTML = '';
        tabelaPresenca.innerHTML = '';
        
        for (const alunoId of salaData.alunos || []) {
            const alunoRef = doc(db, 'alunos', alunoId);
            const alunoDoc = await getDoc(alunoRef);
            
            if (alunoDoc.exists()) {
                const aluno = alunoDoc.data();
                alunosData.set(alunoId, aluno);
                
                // Adicionar à lista de alunos
                const div = document.createElement('div');
                div.className = 'list-group-item';
                div.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="avatar-mini me-3">${aluno.nome.charAt(0)}${aluno.sobrenome ? aluno.sobrenome.charAt(0) : ''}</div>
                        <div>
                            <div class="fw-medium">${aluno.nome} ${aluno.sobrenome || ''}</div>
                            <small class="text-muted">${aluno.matricula || 'Sem matrícula'}</small>
                        </div>
                    </div>
                `;
                listaAlunos.appendChild(div);
                
                // Adicionar à tabela de presença
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-mini me-2">${aluno.nome.charAt(0)}${aluno.sobrenome ? aluno.sobrenome.charAt(0) : ''}</div>
                            <div>
                                <div class="fw-medium">${aluno.nome} ${aluno.sobrenome || ''}</div>
                                <small class="text-muted">${aluno.matricula || 'Sem matrícula'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="presenca_${alunoId}" id="presente_${alunoId}" value="presente" checked>
                            <label class="btn btn-outline-success" for="presente_${alunoId}">
                                <i class="bi bi-check-lg"></i>
                            </label>
                            <input type="radio" class="btn-check" name="presenca_${alunoId}" id="ausente_${alunoId}" value="ausente">
                            <label class="btn btn-outline-danger" for="ausente_${alunoId}">
                                <i class="bi bi-x-lg"></i>
                            </label>
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control" id="obs_${alunoId}" placeholder="Observações">
                    </td>
                `;
                tabelaPresenca.appendChild(tr);
            }
        }
        
        if (salaData.alunos?.length === 0) {
            listaAlunos.innerHTML = `
                <div class="list-group-item text-center py-4">
                    <i class="bi bi-people display-6 text-muted mb-2"></i>
                    <p class="text-muted mb-0">Nenhum aluno matriculado</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        showFeedback('Erro ao carregar alunos', 'danger');
    }
}

// Carregar timeline de presenças
async function carregarTimeline() {
    try {
        timelinePresencas.innerHTML = '';
        
        // Buscar presenças dos últimos 14 dias
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 14);
        
        const q = query(
            collection(db, 'chamadas'),
            where('salaId', '==', currentSala),
            where('data', '>=', dataLimite.toISOString().split('T')[0])
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            timelinePresencas.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-calendar3 display-6 text-muted mb-2"></i>
                    <p class="text-muted mb-0">Nenhuma presença registrada nos últimos 14 dias</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por data
        const chamadas = [];
        querySnapshot.forEach(doc => chamadas.push({ id: doc.id, ...doc.data() }));
        chamadas.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        for (const chamada of chamadas) {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            
            // Calcular estatísticas
            const presentes = chamada.presencas.filter(p => p.presente).length;
            const total = chamada.presencas.length;
            const porcentagem = Math.round((presentes / total) * 100);
            
            div.innerHTML = `
                <div class="timeline-date">
                    ${new Date(chamada.data).toLocaleDateString('pt-BR')}
                </div>
                <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong>Presença: ${porcentagem}%</strong>
                        <small class="text-muted">${presentes}/${total} alunos</small>
                    </div>
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar bg-success" style="width: ${porcentagem}%"></div>
                    </div>
                </div>
            `;
            
            timelinePresencas.appendChild(div);
        }
    } catch (error) {
        console.error('Erro ao carregar timeline:', error);
        showFeedback('Erro ao carregar timeline', 'danger');
    }
}

// Salvar presença
btnSalvarPresenca.addEventListener('click', () => {
    const data = dataPresenca.value;
    
    if (!data) {
        showFeedback('Selecione uma data', 'danger');
        return;
    }
    
    const presencas = [];
    
    // Coletar dados de presença
    salaData.alunos.forEach(alunoId => {
        const presente = document.getElementById(`presente_${alunoId}`).checked;
        const observacoes = document.getElementById(`obs_${alunoId}`).value;
        
        presencas.push({
            alunoId,
            presente,
            observacoes
        });
    });
    
    modalRegistrarPresenca.hide();
    modalConfirmarAlteracao.show();
    
    // Configurar confirmação
    btnConfirmarAlteracao.onclick = async () => {
        const motivo = motivoAlteracao.value;
        
        if (!motivo) {
            showFeedback('Informe o motivo da alteração', 'danger');
            return;
        }
        
        try {
            // Salvar chamada
            await addDoc(collection(db, 'chamadas'), {
                salaId: currentSala,
                data,
                presencas,
                motivo,
                criadoEm: new Date().toISOString(),
                criadoPor: currentUser.uid
            });
            
            modalConfirmarAlteracao.hide();
            showFeedback('Presença registrada com sucesso!');
            
            // Limpar campos
            motivoAlteracao.value = '';
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            
            // Recarregar timeline
            await carregarTimeline();
            
        } catch (error) {
            console.error('Erro ao salvar presença:', error);
            showFeedback('Erro ao salvar presença', 'danger');
        }
    };
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            carregarSala();
        } else {
            window.location.href = 'login.html';
        }
    });
});
