// Configuração da API
const API_BASE_URL = 'http://localhost:3003/api';
let authToken = localStorage.getItem('authToken');

let dataTable;
let currentUser;

// Inicializar a aplicação
async function initializeApp() {
  // Configurar event listeners primeiro
  setupEventListeners();

  // Se não há token, criar usuário mock para desenvolvimento
  if (!authToken) {
    console.warn('Sem token de autenticação - usando modo desenvolvimento');
    currentUser = {
      id: 1,
      nome: 'Usuário Desenvolvimento',
      email: 'dev@ongnovoamanha.org'
    };
    initializeUI(currentUser);
    await loadAlunos();
    return;
  }

  try {
    // Verificar se o token é válido
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Token inválido');
    }

    const userData = await response.json();
    currentUser = userData.user;
    initializeUI(userData.user);
    await loadAlunos();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    // Em caso de erro, usar modo desenvolvimento
    currentUser = {
      id: 1,
      nome: 'Usuário Desenvolvimento',
      email: 'dev@ongnovoamanha.org'
    };
    initializeUI(currentUser);
    await loadAlunos();
  }
}

// Inicializar interface do usuário
function initializeUI(user) {
  document.getElementById('userName').textContent = user.nome || user.email;
  document.getElementById('userEmail').textContent = user.email;
  
  const initials = (user.nome || user.email).split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('userAvatarSmall').textContent = initials;
}

// Carregar alunos da API
async function loadAlunos() {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar token apenas se existir
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/alunos`, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar alunos');
    }

    const data = await response.json();
    const alunos = data.alunos || data; // Suportar tanto formato {alunos: []} quanto array direto
    
    if (dataTable) {
      dataTable.destroy();
    }
    
    // Limpar tabela
    const tbody = document.querySelector('#alunosTable tbody');
    tbody.innerHTML = '';
    
    // Preencher tabela
    alunos.forEach(aluno => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${aluno.nome}</td>
        <td>${aluno.nome_responsavel || 'Não informado'}</td>
        <td>${aluno.telefone || aluno.telefone_responsavel || 'Não informado'}</td>
        <td>
          <span class="badge bg-success">
            ${aluno.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td class="text-end">
          <div class="btn-group">
            <button class="btn btn-sm btn-info" onclick="viewAluno(${aluno.id})" title="Visualizar">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary" onclick="editAluno(${aluno.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteAluno(${aluno.id})" title="Excluir">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
    });

    // Inicializar DataTable
    dataTable = new DataTable('#alunosTable', {
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
      },
      responsive: true,
      order: [[0, 'asc']]
    });

  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    showAlert('Erro ao carregar alunos. Verifique se o servidor está rodando.', 'danger');
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

  // Função auxiliar para obter valor ou null se vazio
  const getValueOrNull = (id) => {
    const element = document.getElementById(id);
    const value = element ? element.value.trim() : '';
    return value === '' ? null : value;
  };

  // Coletar dados do formulário com validação
  const alunoData = {
    nome: document.getElementById('nome').value.trim(),
    data_nasc: document.getElementById('dataNascimento').value,
    sexo: document.getElementById('genero').value === 'masculino' ? 'M' : 
          document.getElementById('genero').value === 'feminino' ? 'F' : 'Outro'
  };

  // Adicionar campos opcionais apenas se preenchidos
  const cpf = getValueOrNull('cpf');
  if (cpf) alunoData.cpf = cpf;

  const rg = getValueOrNull('rg');
  if (rg) alunoData.rg = rg;

  const telefone = getValueOrNull('telefoneResponsavel1');
  if (telefone) alunoData.telefone = telefone;

  // Endereço
  const endereco = getValueOrNull('endereco');
  if (endereco) alunoData.endereco = endereco;

  const numero = getValueOrNull('numero');
  if (numero) alunoData.numero = numero;

  const bairro = getValueOrNull('bairro');
  if (bairro) alunoData.bairro = bairro;

  const cidade = getValueOrNull('cidade');
  if (cidade) alunoData.cidade = cidade;

  const estado = getValueOrNull('estado');
  if (estado) alunoData.estado = estado;

  const cep = getValueOrNull('cep');
  if (cep) alunoData.cep = cep;

  // Responsável
  const nomeResponsavel = getValueOrNull('nomeResponsavel');
  if (nomeResponsavel) alunoData.nome_responsavel = nomeResponsavel;

  const telefoneResponsavel = getValueOrNull('telefoneResponsavel1');
  if (telefoneResponsavel) alunoData.telefone_responsavel = telefoneResponsavel;

  // Informações acadêmicas
  const escola = getValueOrNull('escola');
  if (escola) alunoData.escola = escola;

  const serie = getValueOrNull('periodo');
  if (serie) alunoData.serie = serie;

  // Informações médicas
  const restricaoAlimentar = getValueOrNull('restricaoAlimentar');
  if (restricaoAlimentar) alunoData.restricao_alimentar = restricaoAlimentar;

  const medicamentos = getValueOrNull('medicacao');
  if (medicamentos) alunoData.medicamentos = medicamentos;

  const observacoesMedicas = getValueOrNull('observacoes');
  if (observacoesMedicas) alunoData.observacoes_medicas = observacoesMedicas;

  // Status
  const statusElement = document.getElementById('status');
  if (statusElement) {
    alunoData.ativo = statusElement.value === 'matriculado';
  } else {
    alunoData.ativo = true; // Padrão ativo
  }

  try {
    const alunoId = form.dataset.alunoId;
    const method = alunoId ? 'PUT' : 'POST';
    const url = alunoId ? `${API_BASE_URL}/alunos/${alunoId}` : `${API_BASE_URL}/alunos`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar token apenas se existir
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Debug: mostrar dados sendo enviados
    console.log('Dados sendo enviados:', JSON.stringify(alunoData, null, 2));
    console.log('URL:', url);
    console.log('Method:', method);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(alunoData)
    });

    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Erro detalhado:', errorData);
      
      // Mostrar detalhes do erro se disponível
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessages = errorData.details.map(detail => detail.msg).join(', ');
        throw new Error(`Dados inválidos: ${errorMessages}`);
      }
      
      throw new Error(errorData.error || 'Erro ao salvar aluno');
    }
    
    // Fechar modal e recarregar dados
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAluno'));
    modal.hide();
    
    form.reset();
    form.classList.remove('was-validated');
    delete form.dataset.alunoId;
    
    await loadAlunos();
    showAlert('Aluno salvo com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    showAlert(`Erro ao salvar aluno: ${error.message}`, 'danger');
  }
}

// Visualizar aluno
async function viewAluno(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar dados do aluno');
    }

    const aluno = await response.json();
    
    // Preencher modal de visualização
    const modalBody = document.getElementById('viewAlunoContent');
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6>Dados Pessoais</h6>
          <p><strong>Nome:</strong> ${aluno.nome}</p>
          <p><strong>Data de Nascimento:</strong> ${new Date(aluno.data_nasc).toLocaleDateString()}</p>
          <p><strong>Sexo:</strong> ${aluno.sexo === 'M' ? 'Masculino' : aluno.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
          <p><strong>CPF:</strong> ${aluno.cpf || 'Não informado'}</p>
          <p><strong>RG:</strong> ${aluno.rg || 'Não informado'}</p>
        </div>
        <div class="col-md-6">
          <h6>Responsável</h6>
          <p><strong>Nome:</strong> ${aluno.nome_responsavel || 'Não informado'}</p>
          <p><strong>Telefone:</strong> ${aluno.telefone_responsavel || 'Não informado'}</p>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h6>Endereço</h6>
          <p>${aluno.endereco || ''} ${aluno.numero || ''}, ${aluno.bairro || ''}</p>
          <p>${aluno.cidade || ''} - ${aluno.estado || ''} ${aluno.cep || ''}</p>
        </div>
      </div>
      ${aluno.restricao_alimentar ? `
        <div class="row mt-3">
          <div class="col-12">
            <h6>Restrições Alimentares</h6>
            <p>${aluno.restricao_alimentar}</p>
          </div>
        </div>
      ` : ''}
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('viewModal'));
    modal.show();
    
  } catch (error) {
    console.error('Erro ao visualizar aluno:', error);
    showAlert('Erro ao carregar dados do aluno', 'danger');
  }
}

// Editar aluno
async function editAluno(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar dados do aluno');
    }

    const aluno = await response.json();
    const form = document.getElementById('alunoForm');
    
    // Preencher formulário
    form.dataset.alunoId = id;
    document.getElementById('nome').value = aluno.nome || '';
    document.getElementById('dataNascimento').value = aluno.data_nasc || '';
    document.getElementById('genero').value = aluno.sexo === 'M' ? 'masculino' : 
                                            aluno.sexo === 'F' ? 'feminino' : 'outro';
    document.getElementById('cpf').value = aluno.cpf || '';
    document.getElementById('rg').value = aluno.rg || '';
    document.getElementById('endereco').value = aluno.endereco || '';
    document.getElementById('numero').value = aluno.numero || '';
    document.getElementById('bairro').value = aluno.bairro || '';
    document.getElementById('cidade').value = aluno.cidade || '';
    document.getElementById('estado').value = aluno.estado || '';
    document.getElementById('cep').value = aluno.cep || '';
    document.getElementById('nomeResponsavel').value = aluno.nome_responsavel || '';
    document.getElementById('telefoneResponsavel1').value = aluno.telefone_responsavel || '';
    document.getElementById('escola').value = aluno.escola || '';
    document.getElementById('periodo').value = aluno.serie || '';
    document.getElementById('restricaoAlimentar').value = aluno.restricao_alimentar || '';
    document.getElementById('medicacao').value = aluno.medicamentos || '';
    document.getElementById('observacoes').value = aluno.observacoes_medicas || '';
    document.getElementById('status').value = aluno.ativo ? 'matriculado' : 'inativo';
    
    // Alterar título do modal
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Aluno';
    
    const modal = new bootstrap.Modal(document.getElementById('modalAluno'));
    modal.show();
    
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    showAlert('Erro ao carregar dados do aluno', 'danger');
  }
}

// Excluir aluno
async function deleteAluno(id) {
  if (!confirm('Tem certeza que deseja excluir este aluno?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir aluno');
    }

    await loadAlunos();
    showAlert('Aluno excluído com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    showAlert('Erro ao excluir aluno', 'danger');
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Botão novo aluno
  const btnNovoAluno = document.querySelector('[data-bs-target="#modalAluno"]');
  if (btnNovoAluno) {
    btnNovoAluno.addEventListener('click', () => {
      const form = document.getElementById('alunoForm');
      form.reset();
      form.classList.remove('was-validated');
      delete form.dataset.alunoId;
      document.getElementById('modalTitle').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Novo Aluno';
    });
  }

  // Botão salvar
  const btnSalvar = document.getElementById('btnSalvarAluno');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', saveAluno);
  }
  
  // Logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    });
  }

  // Buscar endereço pelo CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('blur', async () => {
      let cep = cepInput.value.replace(/\D/g, '');
      if (cep.length !== 8) return;
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          document.getElementById('endereco').value = data.logradouro || '';
          document.getElementById('bairro').value = data.bairro || '';
          document.getElementById('cidade').value = data.localidade || '';
          document.getElementById('estado').value = data.uf || '';
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    });
  }
}

// Mostrar alertas
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 5000);
}

// Tornar funções globais
window.viewAluno = viewAluno;
window.editAluno = editAluno;
window.deleteAluno = deleteAluno;

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);
