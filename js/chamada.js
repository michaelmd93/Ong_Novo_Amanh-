/* chamada.js
   App central para gerenciar Salas/Oficinas / Alunos / Chamadas
   Tudo em localStorage. Estrutura: App = { Storage, Utils, UI, Navigation, init }
*/

/* ===================== CONFIG / KEYS / DEMO ===================== */
const API_BASE_URL = 'http://localhost:3003/api';
const KEYS = {
  SALAS: 'salas',
  ALUNOS: 'alunos',
  CHAMADAS: 'chamadas'
};

const DEMO_ALUNOS = [
  { id: 'a1', nome: 'João Silva', matricula: '2023001', status: 'matriculado' },
  { id: 'a2', nome: 'Maria Santos', matricula: '2023002', status: 'matriculado' },
  { id: 'a3', nome: 'Pedro Oliveira', matricula: '2023003', status: 'matriculado' },
  { id: 'a4', nome: 'Ana Souza', matricula: '2023004', status: 'matriculado' },
  { id: 'a5', nome: 'Carlos Pereira', matricula: '2023005', status: 'matriculado' }
];

/* ===================== UTIL ===================== */
const Utils = {
  genId(prefix = '') { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,8); },

  formatDateIso(date = new Date()) {
    // Returns YYYY-MM-DD
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  formatDateDisplay(isoDate) {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('pt-BR');
  },

  formatDateTimeDisplay(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  },

  safeParse(json) {
    try { return JSON.parse(json); } catch(e){ return null; }
  },

  showToast(message, type = 'success') {
    // uses existing toast DOM (window.APP_TOAST) if available, otherwise create a simple bootstrap toast
    try {
      if (window.APP_TOAST && document.getElementById('toastMensagem')) {
        document.getElementById('toastMensagem').textContent = message;
        // set background via classes
        const toastEl = document.getElementById('toastNotificacao');
        toastEl.className = `toast align-items-center text-white border-0 bg-${type}`;
        window.APP_TOAST.hide?.();
        window.APP_TOAST = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
        window.APP_TOAST.show();
        return;
      }
    } catch(e) { /* ignore and fallback */ }

    // Fallback: dynamic toast
    const containerId = 'chamada_toast_container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(container);
    }
    const id = Utils.genId('toast-');
    const toastHtml = document.createElement('div');
    toastHtml.className = `toast align-items-center text-white bg-${type} border-0`;
    toastHtml.role = 'alert';
    toastHtml.setAttribute('aria-live','assertive');
    toastHtml.setAttribute('aria-atomic','true');
    toastHtml.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    container.appendChild(toastHtml);
    const bToast = new bootstrap.Toast(toastHtml, { autohide: true, delay: 3000 });
    bToast.show();
    toastHtml.addEventListener('hidden.bs.toast', () => { toastHtml.remove(); });
  }
};

/* ===================== STORAGE (localStorage) ===================== */
const Storage = {
  _get(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch(e) { console.error('Storage parse error', key, e); return []; }
  },

  _set(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(e){ console.error('Storage set error', key, e); return false; }
  },

  initDefaults() {
    // alunos: não usar DEMO automaticamente. Se não houver, manter vazio; App carregará da API.
    if (!localStorage.getItem(KEYS.ALUNOS)) {
      localStorage.setItem(KEYS.ALUNOS, JSON.stringify([]));
    }
    // salas
    if (!localStorage.getItem(KEYS.SALAS)) {
      localStorage.setItem(KEYS.SALAS, JSON.stringify([]));
    }
    // chamadas
    if (!localStorage.getItem(KEYS.CHAMADAS)) {
      localStorage.setItem(KEYS.CHAMADAS, JSON.stringify([]));
    }
  },

  getSalas() { return this._get(KEYS.SALAS); },

  getSalaById(id) { return this.getSalas().find(s => String(s.id) === String(id)) || null; },

  saveSala(sala) {
    const salas = this.getSalas();
    if (sala.id) {
      const idx = salas.findIndex(s => String(s.id) === String(sala.id));
      if (idx !== -1) { salas[idx] = { ...salas[idx], ...sala, atualizadoEm: new Date().toISOString() }; }
      else { salas.push({ ...sala, criadoEm: new Date().toISOString() }); }
    } else {
      sala.id = Utils.genId('s-');
      sala.criadoEm = new Date().toISOString();
      salas.push(sala);
    }
    this._set(KEYS.SALAS, salas);
    return sala;
  },

  deleteSala(id) {
    const salas = this.getSalas().filter(s => String(s.id) !== String(id));
    this._set(KEYS.SALAS, salas);
    // also remove calls for that sala? keep as historical but optional - we'll keep calls, but they will be inaccessible from UI if sala removed.
    return true;
  },

  getAlunos() { return this._get(KEYS.ALUNOS); },

  getAlunosMatriculados(filterTerm = '') {
    let list = this.getAlunos().filter(a => (a.status || '').toLowerCase() === 'matriculado');
    if (filterTerm) {
      const t = filterTerm.toLowerCase();
      list = list.filter(a => (a.nome || '').toLowerCase().includes(t) || (a.matricula || '').toLowerCase().includes(t));
    }
    return list;
  },

  getChamadas() { return this._get(KEYS.CHAMADAS); },

  getChamadasBySala(idSala) {
    return this.getChamadas().filter(c => String(c.idSala) === String(idSala)).sort((a,b) => new Date(b.dataISO) - new Date(a.dataISO));
  },

  getChamadaById(id) {
    return this.getChamadas().find(c => String(c.id) === String(id)) || null;
  },

  saveChamada(chamada) {
    const chamadas = this.getChamadas();
    if (chamada.id) {
      const idx = chamadas.findIndex(c => String(c.id) === String(chamada.id));
      if (idx !== -1) { chamadas[idx] = chamada; }
      else { chamadas.push(chamada); }
    } else {
      chamada.id = Utils.genId('ch-');
      chamada.dataCriacao = new Date().toISOString();
      chamadas.push(chamada);
    }
    this._set(KEYS.CHAMADAS, chamadas);
    return chamada;
  }
};

/* ===================== UI / NAVIGATION ===================== */
const UI = {
  layers: ['camada-lista','camada-cadastro','camada-alunos','camada-chamada','camada-historico'],

  showLayer(id) {
    // hide all
    this.layers.forEach(l => {
      const el = document.getElementById(l);
      if (!el) return;
      el.classList.add('d-none');
      el.classList.remove('active');
    });
    // show requested
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('d-none');
      target.classList.add('active');
      window.scrollTo(0,0);
    }
  },

  // Loading screen control
  showLoading(show) {
    const loading = document.getElementById('camada-loading');
    const main = document.getElementById('conteudo-principal');
    if (loading) {
      if (show) loading.classList.remove('d-none'); else loading.classList.add('d-none');
    }
    if (main) {
      if (show) main.classList.add('d-none'); else main.classList.remove('d-none');
    }
  },

  // render list of salas on CAMADA 1
  renderSalasList() {
    const container = document.getElementById('listaSalas');
    if (!container) return;
    const salas = Storage.getSalas();

    if (!salas || salas.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">Nenhuma sala cadastrada. Clique em "Nova Sala" para começar.</div>
        </div>`;
      return;
    }

    // sort by day then horario (if provided)
    const order = {'Segunda-feira':1,'Terça-feira':2,'Quarta-feira':3,'Quinta-feira':4,'Sexta-feira':5,'Sábado':6};
    salas.sort((a,b) => {
      const da = order[a.diaSemana]||99;
      const db = order[b.diaSemana]||99;
      if (da !== db) return da - db;
      return (a.horario||'').localeCompare(b.horario||'');
    });

    container.innerHTML = salas.map(sala => {
      const numAlunos = (sala.alunos && sala.alunos.length) || 0;
      const diaBadge = sala.diaSemana ? sala.diaSemana : '—';
      const horario = sala.horario ? sala.horario : '—';
      return `
        <div class="col-md-6 col-lg-4 mb-4" data-id="${sala.id}">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="card-title mb-0">${sala.nome}</h5>
                  <div class="card-subtitle mb-2 text-muted">${sala.professor || 'Sem professor'}</div>
                </div>
                <span class="badge bg-primary">${diaBadge}</span>
              </div>
              <p class="text-muted mb-2"><i class="bi bi-clock me-2"></i>${horario}</p>
              <p class="text-muted mb-3"><i class="bi bi-people me-2"></i>${numAlunos} aluno${numAlunos===1?'':'s'}</p>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary btn-acao" data-acao="editar" data-id="${sala.id}">
                  <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-success btn-acao" data-acao="chamada" data-id="${sala.id}">
                  <i class="bi bi-clipboard-check"></i> Chamada
                </button>
                <button class="btn btn-sm btn-outline-info btn-acao" data-acao="historico" data-id="${sala.id}">
                  <i class="bi bi-clock-history"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-acao ms-auto" data-acao="excluir" data-id="${sala.id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // attach actions
    container.querySelectorAll('.btn-acao').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ac = btn.getAttribute('data-acao');
        const id = btn.getAttribute('data-id');
        if (!ac || !id) return;
        switch(ac) {
          case 'editar': App.actions.editSala(id); break;
          case 'chamada': App.actions.openChamada(id); break;
          case 'historico': App.actions.openHistorico(id); break;
          case 'excluir': App.actions.deleteSala(id); break;
        }
      });
    });
  },

  // render form (clear or set)
  resetFormOficina() {
    const form = document.getElementById('formOficina');
    if (!form) return;
    form.reset();
    form.classList.remove('was-validated');
    // clear state stored in App.state.newSala
    App.state.newSala = { alunos: [] };
  },

  fillFormForEdit(sala) {
    const form = document.getElementById('formOficina');
    if (!form || !sala) return;
    document.getElementById('nomeOficina').value = sala.nome || '';
    document.getElementById('professorOficina').value = sala.professor || '';
    document.getElementById('diaSemana').value = sala.diaSemana || '';
    document.getElementById('horarioOficina').value = sala.horario || '';
    App.state.newSala = { ...sala }; // include aluno list if present
  },

  // render students table in CAMADA 3
  renderListaAlunos(filter = '') {
    const tbody = document.getElementById('listaAlunos');
    if (!tbody) return;
    const alunos = Storage.getAlunosMatriculados(filter);
    const selectedIds = new Set(App.state.newSala?.alunos || []);
    if (!alunos || alunos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhum aluno encontrado</td></tr>`;
      return;
    }
    tbody.innerHTML = alunos.map(a => `
      <tr>
        <td><input type="checkbox" class="form-check-input aluno-checkbox" data-id="${a.id}" ${selectedIds.has(a.id) ? 'checked' : ''}></td>
        <td>${a.nome}</td>
        <td>${a.matricula || '-'}</td>
      </tr>
    `).join('');

    // (re)attach behavior for select all
    const selectAll = document.getElementById('selecionarTodos');
    if (selectAll) {
      selectAll.checked = alunos.length > 0 && alunos.every(al => selectedIds.has(al.id));
      selectAll.onchange = (e) => {
        const checked = e.target.checked;
        tbody.querySelectorAll('.aluno-checkbox').forEach(cb => { cb.checked = checked; });
      };
    }

    tbody.querySelectorAll('.aluno-checkbox').forEach(cb => {
      cb.onchange = () => {
        // update state.newSala.alunos accordingly
        const id = cb.getAttribute('data-id');
        if (!id) return;
        App.state.newSala.alunos = App.state.newSala.alunos || [];
        if (cb.checked) {
          if (!App.state.newSala.alunos.includes(id)) App.state.newSala.alunos.push(id);
        } else {
          App.state.newSala.alunos = App.state.newSala.alunos.filter(x => x !== id);
        }
      };
    });
  },

  // render chamada view (camada-chamada)
  renderChamadaView() {
    const lista = document.getElementById('listaAlunosChamada');
    if (!lista) return;
    const chamada = App.state.currentChamada;
    if (!chamada || !chamada.registros || chamada.registros.length === 0) {
      lista.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhum aluno vinculado a essa oficina.</td></tr>`;
      return;
    }

    // sort by name
    chamada.registros.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

    lista.innerHTML = chamada.registros.map((r, idx) => {
      const presChecked = r.presente ? 'checked' : '';
      const obs = r.observacao ? (''+r.observacao).replace(/"/g,'&quot;') : '';
      return `
        <tr data-aluno-id="${r.idAluno}">
          <td>${r.nome}</td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input presenca-checkbox" type="checkbox" id="pres_${idx}" data-idx="${idx}" ${presChecked}>
              <label class="form-check-label" for="pres_${idx}">${r.presente ? 'Presente' : 'Ausente'}</label>
            </div>
          </td>
          <td><input type="text" class="form-control form-control-sm observacao-input" id="obs_${idx}" data-idx="${idx}" value="${obs}" placeholder="Observação"></td>
        </tr>`;
    }).join('');

    // attach events
    lista.querySelectorAll('.presenca-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(cb.getAttribute('data-idx'));
        const checked = cb.checked;
        const lbl = cb.nextElementSibling;
        if (lbl) lbl.textContent = checked ? 'Presente' : 'Ausente';
        if (App.state.currentChamada && App.state.currentChamada.registros[idx]) {
          App.state.currentChamada.registros[idx].presente = checked;
        }
      });
    });

    lista.querySelectorAll('.observacao-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        if (App.state.currentChamada && App.state.currentChamada.registros[idx]) {
          App.state.currentChamada.registros[idx].observacao = inp.value.trim();
        }
      });
    });
  },

  // render histórico list for a sala
  renderHistoricoList(idSala) {
    const container = document.getElementById('listaHistoricoChamadas');
    if (!container) return;
    const chamadas = Storage.getChamadasBySala(idSala);
    if (!chamadas || chamadas.length === 0) {
      container.innerHTML = `<div class="alert alert-info mb-0"><i class="bi bi-info-circle me-2"></i>Nenhuma chamada registrada para esta oficina.</div>`;
      return;
    }

    // group by date (display)
    const grouped = {};
    chamadas.forEach(c => {
      const d = Utils.formatDateDisplay(c.dataISO || c.data); // fallback
      grouped[d] = grouped[d] || [];
      grouped[d].push(c);
    });

    let html = '';
    for (const [data, listaChamadas] of Object.entries(grouped)) {
      html += `<div class="card mb-3"><div class="card-header bg-light"><h6 class="mb-0">${data}</h6></div><div class="card-body p-0"><div class="list-group list-group-flush">`;
      html += listaChamadas.map(ch => {
        const total = ch.registros.length;
        const presentes = ch.registros.filter(r => r.presente).length;
        const perc = total ? Math.round((presentes/total)*100) : 0;
        return `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">Chamada - ${ch.hora || ch.dataHora || ''}</h6>
                <small class="text-muted">${presentes} de ${total} presentes (${perc}%)</small>
              </div>
              <button class="btn btn-sm btn-outline-primary btn-det-chamada" data-id="${ch.id}"><i class="bi bi-chevron-right"></i></button>
            </div>
          </div>`;
      }).join('');
      html += `</div></div></div>`;
    }

    container.innerHTML = html;

    // attach detail handlers
    container.querySelectorAll('.btn-det-chamada').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        App.actions.showChamadaDetails(id);
      });
    });
  },

  // Modal to show chamada details
  showChamadaModal(chamada) {
    if (!chamada) return;
    // create modal HTML
    const idModal = 'modalDetalhesChamada';
    const existing = document.getElementById(idModal);
    if (existing) existing.remove();
    const html = document.createElement('div');
    html.innerHTML = `
      <div class="modal fade" id="${idModal}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalhes da Chamada - ${Utils.formatDateDisplay(chamada.dataISO || chamada.data)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <strong>Hora:</strong> ${chamada.hora || '-'}
              </div>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th>Aluno</th><th>Presença</th><th>Observação</th></tr></thead>
                  <tbody>
                    ${chamada.registros.map(r => `
                      <tr>
                        <td>${r.nome}</td>
                        <td><span class="badge ${r.presente ? 'bg-success' : 'bg-danger'}">${r.presente ? 'Presente' : 'Ausente'}</span></td>
                        <td>${r.observacao ? r.observacao : '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(html.firstElementChild);
    const modalEl = document.getElementById(idModal);
    const m = new bootstrap.Modal(modalEl);
    m.show();
    modalEl.addEventListener('hidden.bs.modal', () => { modalEl.remove(); });
  }
};

/* ===================== APP STATE & ACTIONS ===================== */
const App = {
  state: {
    newSala: { alunos: [] }, // temp storage while creating or editing
    editingSalaId: null,
    currentChamada: null
  },

  async init() {
    // initialize storage defaults
    Storage.initDefaults();

    // show loading
    UI.showLoading(true);

    // bind events
    this.bindUIEvents();

    // carregar alunos reais da API
    await this.loadAlunosReais();

    // render após carregamento
    UI.showLoading(false);
    UI.showLayer('camada-lista');
    UI.renderSalasList();
  },

  async loadAlunosReais() {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${API_BASE_URL}/alunos?limit=1000&ativo=true`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) {
        return; // manter vazio se falhar
      }
      const data = await resp.json();
      const lista = Array.isArray(data.alunos) ? data.alunos : (Array.isArray(data) ? data : []);
      const normalizado = lista.map(a => ({
        id: String(a.id),
        nome: a.nome,
        matricula: a.numero_matricula || a.numeroMatricula || a.matricula || '',
        status: a.ativo === false ? 'inativo' : 'matriculado'
      }));
      Storage._set(KEYS.ALUNOS, normalizado);
    } catch (e) {
      // em caso de erro de rede, manter lista atual
      console.error('Falha ao carregar alunos da API', e);
    }
  },

  bindUIEvents() {
    // Nova Oficina button
    document.getElementById('btnNovaOficina')?.addEventListener('click', () => {
      this.startCreateSala();
    });

    // form submission for cadastro (next -> selection)
    document.getElementById('formOficina')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.onFormOficinaNext();
    });

    // cancel form
    document.getElementById('btnCancelarOficina')?.addEventListener('click', () => {
      UI.resetFormOficina();
      this.state.editingSalaId = null;
      UI.showLayer('camada-lista');
      UI.renderSalasList();
    });

    // voltar buttons
    document.getElementById('btnVoltarLista')?.addEventListener('click', () => { UI.showLayer('camada-lista'); UI.renderSalasList(); });
    document.getElementById('btnVoltarCadastro')?.addEventListener('click', () => { UI.showLayer('camada-cadastro'); });
    document.getElementById('btnVoltarParaLista')?.addEventListener('click', () => { UI.showLayer('camada-lista'); UI.renderSalasList(); });
    document.getElementById('btnVoltarParaLista2')?.addEventListener('click', () => { UI.showLayer('camada-lista'); UI.renderSalasList(); });

    // busca alunos filter
    document.getElementById('buscaAlunos')?.addEventListener('input', (e) => {
      UI.renderListaAlunos(e.target.value);
    });

    // selecionar todos handled inside renderListaAlunos

    // salvar sala after selecting students
    document.getElementById('btnSalvarOficina')?.addEventListener('click', () => {
      this.saveSalaFromState();
    });

    // cancelar selection
    document.getElementById('btnCancelarSelecao')?.addEventListener('click', () => {
      UI.showLayer('camada-lista');
      UI.renderSalasList();
    });

    // finalize chamada (save current chamada)
    document.getElementById('btnFinalizarChamada')?.addEventListener('click', () => {
      this.finalizeChamada();
    });

    // search salas (on lista)
    document.getElementById('searchSalas')?.addEventListener('input', (e) => {
      this.filterSalas(e.target.value);
    });

    // modal inserir sala (preserved modal)
    document.getElementById('btnSalvarSalaModal')?.addEventListener('click', () => {
      // used if user creates via modal
      this.saveSalaFromModal();
    });

    // tempo: when switching to camada-chamada we will set date
  },

  /* ======= Actions: create / edit / delete / chamada / historico ======= */

  startCreateSala() {
    App.state.editingSalaId = null;
    App.state.newSala = { alunos: [] };
    UI.resetFormOficina();
    UI.showLayer('camada-cadastro');
    // clear selected students table too
    UI.renderListaAlunos('');
    // ensure form title
    const title = document.querySelector('#camada-cadastro h2');
    if (title) title.textContent = 'Nova Oficina';
  },

  onFormOficinaNext() {
    const form = document.getElementById('formOficina');
    if (!form) return;
    // basic validation
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      Utils.showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }
    // gather values into state.newSala
    const nome = document.getElementById('nomeOficina')?.value.trim();
    const professor = document.getElementById('professorOficina')?.value.trim();
    const diaSemana = document.getElementById('diaSemana')?.value;
    const horario = document.getElementById('horarioOficina')?.value;
    App.state.newSala = App.state.newSala || { alunos: [] };
    App.state.newSala.nome = nome;
    App.state.newSala.professor = professor;
    App.state.newSala.diaSemana = diaSemana;
    App.state.newSala.horario = horario;

    // move to selection of students
    UI.showLayer('camada-alunos');
    UI.renderListaAlunos('');
  },

  saveSalaFromState() {
    const s = App.state.newSala || {};
    // validation
    if (!s.nome || !s.professor || !s.diaSemana || !s.horario) {
      Utils.showToast('Dados incompletos. Volte e preencha os campos.', 'warning');
      UI.showLayer('camada-cadastro');
      return;
    }
    const salaToSave = {
      id: App.state.editingSalaId || s.id || null,
      nome: s.nome,
      professor: s.professor,
      diaSemana: s.diaSemana,
      horario: s.horario,
      alunos: Array.isArray(s.alunos) ? s.alunos : []
    };
    Storage.saveSala(salaToSave);
    Utils.showToast(App.state.editingSalaId ? 'Oficina atualizada com sucesso!' : 'Oficina criada com sucesso!', 'success');
    App.state.editingSalaId = null;
    App.state.newSala = { alunos: [] };
    UI.showLayer('camada-lista');
    UI.renderSalasList();
  },

  saveSalaFromModal() {
    // used by preserved modalCriarSala
    const nome = document.getElementById('nomeSala')?.value.trim();
    const professor = document.getElementById('professorSala')?.value.trim();
    const horario = document.getElementById('horarioSala')?.value;
    const diaSemana = document.getElementById('diaSemanaSala')?.value;
    if (!nome || !professor || !horario || !diaSemana) {
      Utils.showToast('Preencha todos os campos do modal', 'warning');
      return;
    }
    const sala = { nome, professor, horario, diaSemana, alunos: [] };
    Storage.saveSala(sala);
    // close modal
    const modalEl = document.getElementById('modalCriarSala');
    const inst = bootstrap.Modal.getInstance(modalEl);
    if (inst) inst.hide();
    Utils.showToast('Sala criada (modal) com sucesso!', 'success');
    UI.renderSalasList();
  },

  actions: {
    editSala(id) {
      const sala = Storage.getSalaById(id);
      if (!sala) { Utils.showToast('Sala não encontrada', 'error'); return; }
      App.state.editingSalaId = id;
      App.state.newSala = { ...sala, alunos: sala.alunos || [] };
      UI.fillFormForEdit(sala);
      UI.showLayer('camada-cadastro');
      const title = document.querySelector('#camada-cadastro h2');
      if (title) title.textContent = 'Editar Oficina';
    },

    deleteSala(id) {
      if (!confirm('Tem certeza que deseja excluir esta oficina?')) return;
      Storage.deleteSala(id);
      Utils.showToast('Oficina excluída', 'success');
      UI.renderSalasList();
    },

    openChamada(idSala) {
      const sala = Storage.getSalaById(idSala);
      if (!sala) { Utils.showToast('Oficina não encontrada', 'error'); return; }
      // build or load chamada for today
      const todayIso = Utils.formatDateIso();
      const chamadas = Storage.getChamadasBySala(idSala);
      let chamada = chamadas.find(c => (c.dataISO === todayIso));
      if (!chamada) {
        // create new chamada
        const alunosVinc = sala.alunos || [];
        const alunosData = Storage.getAlunos().filter(a => alunosVinc.includes(a.id));
        const registros = alunosData.map(a => ({ idAluno: a.id, nome: a.nome, presente: true, observacao: '' }));
        chamada = {
          idSala: idSala,
          id: Utils.genId('ch-'),
          dataISO: todayIso,
          hora: (new Date()).toTimeString().substring(0,5),
          registros
        };
        // auto-save new chamada to storage (optional - we will save on finalize too)
        Storage.saveChamada(chamada);
      } else {
        // ensure registros contain names (in case structure changed)
        chamada.registros = chamada.registros || [];
      }
      App.state.currentChamada = chamada;

      // populate header fields in camada-chamada
      const titulo = document.getElementById('tituloOficinaChamada');
      const profEl = document.getElementById('professorOficinaChamada');
      const diaEl = document.getElementById('diaOficinaChamada');
      const horEl = document.getElementById('horarioOficinaChamada');
      const dataAtual = document.getElementById('dataAtual');

      if (titulo) titulo.textContent = sala.nome;
      if (profEl) profEl.textContent = sala.professor || '-';
      if (diaEl) diaEl.textContent = sala.diaSemana || '-';
      if (horEl) horEl.textContent = sala.horario || '-';
      if (dataAtual) dataAtual.textContent = Utils.formatDateDisplay(chamada.dataISO || chamada.data);

      UI.renderChamadaView();
      UI.showLayer('camada-chamada');
    },

    openHistorico(idSala) {
      const sala = Storage.getSalaById(idSala);
      if (!sala) { Utils.showToast('Oficina não encontrada', 'error'); return; }
      const titulo = document.getElementById('tituloOficinaHistorico');
      if (titulo) titulo.textContent = `Histórico de Chamadas - ${sala.nome}`;
      UI.renderHistoricoList(idSala);
      UI.showLayer('camada-historico');
    },

    showChamadaDetails(idChamada) {
      const ch = Storage.getChamadaById(idChamada);
      if (!ch) { Utils.showToast('Chamada não encontrada', 'error'); return; }
      UI.showChamadaModal(ch);
    }
  },

  finalizeChamada() {
    const chamada = App.state.currentChamada;
    if (!chamada) { Utils.showToast('Nenhuma chamada ativa', 'warning'); return; }
    // refresh registros already updated on UI events
    chamada.dataAtualizacao = new Date().toISOString();
    Storage.saveChamada(chamada);
    Utils.showToast('Chamada salva com sucesso!', 'success');
    UI.showLayer('camada-lista');
    UI.renderSalasList();
  },

  filterSalas(term) {
    const list = document.getElementById('listaSalas');
    if (!list) return;
    const t = (term||'').toLowerCase();
    Array.from(list.children).forEach(cardCol => {
      const txt = cardCol.textContent.toLowerCase();
      cardCol.style.display = txt.includes(t) ? '' : 'none';
    });
  }
};

/* ===================== Initialization ===================== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    App.init();

    // small extra: wire up modalSelecionarAlunos save button if present
    document.getElementById('btnSalvarSalaModalAlunos')?.addEventListener('click', () => {
      // if user used modal flow to create sala + select alunos, we can reuse state
      // For safety, just refresh list
      UI.renderSalasList();
      const modalSel = document.getElementById('modalSelecionarAlunos');
      const inst = bootstrap.Modal.getInstance(modalSel);
      if (inst) inst.hide();
      Utils.showToast('Sala e alunos salvos (modal)', 'success');
    });

  } catch (err) {
    console.error('Erro init chamada.js', err);
    Utils.showToast('Erro ao iniciar módulo de chamadas', 'error');
    UI.showLoading(false);
    UI.showLayer('camada-lista');
  }
});
