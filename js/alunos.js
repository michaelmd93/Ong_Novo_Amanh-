import { getAlunos, getAluno, addAluno, updateAluno, deleteAluno, onAuthStateChanged } from './firebase-alunos.js';

let dataTable;
let currentUser;

// Inicializar a aplicação
async function initializeApp() {
  // Verificar autenticação
  onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      initializeUI(user);
      loadAlunos();
    } else {
      window.location.href = 'login.html';
    }
  });

  // Configurar event listeners
  setupEventListeners();
}

// Inicializar interface do usuário
function initializeUI(user) {
  document.getElementById('userName').textContent = user.displayName || user.email;
  document.getElementById('userEmail').textContent = user.email;
  
  const initials = (user.displayName || user.email).split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('userAvatarSmall').textContent = initials;
}

// Carregar alunos
async function loadAlunos() {
  try {
    const alunos = await getAlunos();
    if (dataTable) {
      dataTable.destroy();
    }
    
    dataTable = new DataTable('#alunosTable', {
      data: alunos,
      columns: [
        { data: 'nome' },
        { 
          data: 'data_nasc',
          render: (data) => calculateAge(data) + ' anos'
        },
        { data: 'status' },
        {
          data: null,
          render: (data, type, row) => `
            <div class="btn-group">
              <button class="btn btn-sm btn-info" onclick="viewAluno('${row.id}')">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-primary" onclick="editAluno('${row.id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteAluno('${row.id}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          `
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
      }
    });
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    alert('Erro ao carregar alunos. Por favor, tente novamente.');
  }
}

// Salvar aluno
async function saveAluno(event) {
  event.preventDefault();
  
  const form = document.getElementById('alunoForm');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = new FormData(form);
  const alunoData = Object.fromEntries(formData.entries());
  
  try {
    const alunoId = form.dataset.alunoId;
    if (alunoId) {
      await updateAluno(alunoId, alunoData);
    } else {
      await addAluno(alunoData);
    }
    
    bootstrap.Modal.getInstance(document.getElementById('modalAluno')).hide();
    loadAlunos();
    form.reset();
    form.classList.remove('was-validated');
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    alert('Erro ao salvar aluno. Por favor, tente novamente.');
  }
}

// Visualizar aluno
async function viewAluno(id) {
  try {
    const aluno = await getAluno(id);
    if (aluno) {
      const modal = new bootstrap.Modal(document.getElementById('viewModal'));
      
      // Preencher dados do aluno no modal
      Object.entries(aluno).forEach(([key, value]) => {
        const element = document.getElementById(`view_${key}`);
        if (element) {
          if (key === 'data_nasc') {
            element.textContent = new Date(value).toLocaleDateString();
          } else {
            element.textContent = value;
          }
        }
      });
      
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao visualizar aluno:', error);
    alert('Erro ao carregar dados do aluno. Por favor, tente novamente.');
  }
}

// Editar aluno
async function editAluno(id) {
  try {
    const aluno = await getAluno(id);
    if (aluno) {
      const form = document.getElementById('alunoForm');
      form.dataset.alunoId = id;
      
      // Preencher formulário com dados do aluno
      Object.entries(aluno).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) {
          input.value = value;
        }
      });
      
      const modal = new bootstrap.Modal(document.getElementById('modalAluno'));
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    alert('Erro ao carregar dados do aluno. Por favor, tente novamente.');
  }
}

// Excluir aluno
async function deleteAluno(id) {
  if (confirm('Tem certeza que deseja excluir este aluno?')) {
    try {
      await deleteAluno(id);
      loadAlunos();
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      alert('Erro ao excluir aluno. Por favor, tente novamente.');
    }
  }
}

// Configurar event listeners
function setupEventListeners() {
  document.getElementById('btnNovoAluno').addEventListener('click', () => {
    const form = document.getElementById('alunoForm');
    form.reset();
    form.classList.remove('was-validated');
    delete form.dataset.alunoId;
    
    const modal = new bootstrap.Modal(document.getElementById('modalAluno'));
    modal.show();
  });

  document.getElementById('btnSalvarAluno').addEventListener('click', saveAluno);
  
  document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  });
}

// Calcular idade
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);
