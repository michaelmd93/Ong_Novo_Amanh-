import { NotificationCenter } from './notifications.js';

class DoacoesManager {
    constructor() {
        this.db = getFirestore();
        this.setupEventListeners();
        this.loadDoacoes();
        this.setupAuthListener();
    }

    // Configurar listener de autenticação
    setupAuthListener() {
            if (!user) {
                window.location.href = 'index.html';
            }
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Listeners para filtros
        (document.getElementById('searchInput').addEventListener('input', () => this.aplicarFiltros());
        (document.getElementById('tipoFilter').addEventListener('change', () => this.aplicarFiltros());
        (document.getElementById('statusFilter').addEventListener('change', () => this.aplicarFiltros());
        (document.getElementById('dataFilter').addEventListener('change', () => this.aplicarFiltros());
        (document.getElementById('limparFiltros').addEventListener('click', () => this.limparFiltros());

        // Listener para tipo de doação
        (document.getElementById('doacaoTipo').addEventListener('change', (e) => {
            const valorField = (document.getElementById('valorField');
            const itensContainer = (document.getElementById('itensContainer');

            if (e.target.value === 'monetaria') {
                valorField.style.display = 'block';
                itensContainer.style.display = 'none';
            } else {
                valorField.style.display = 'none';
                itensContainer.style.display = 'block';
            }
        });

        // Listener para adicionar item
        (document.getElementById('addItem').addEventListener('click', () => this.adicionarItemRow());

        // Listener para salvar doação
        (document.getElementById('salvarDoacao').addEventListener('click', () => this.salvarDoacao());

        // Listener para remover itens (delegação de eventos)
        (document.getElementById('itensList').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const row = e.target.closest('.item-row');
                if (row && row.parentElement.children.length > 1) {
                    row.remove();
                }
            }
        });
    }

    // Carregar doações do Firestore
    async loadDoacoes() {
        try {
            const doacoesRef = collection(this.db, 'doacoes');
            const q = query(doacoesRef, orderBy('data', 'desc'));
            const querySnapshot = await getDocs(q);
            
            this.doacoes = [];
            querySnapshot.forEach(doc => {
                this.doacoes.push({ id: doc.id, ...doc.data() });
            });

            this.renderizarDoacoes();
            this.atualizarEstatisticas();
        } catch (error) {
            console.error('Erro ao carregar doações:', error);
            NotificationCenter.create({
                type: 'danger',
                title: 'Erro',
                message: 'Não foi possível carregar as doações.'
            });
        }
    }

    // Renderizar doações na tabela
    renderizarDoacoes(doacoesFiltradas = null) {
        const tbody = (document.getElementById('doacoesTableBody');
        const emptyState = (document.getElementById('emptyState');
        const doacoes = doacoesFiltradas || this.doacoes;

        tbody.innerHTML = '';

        if (doacoes.length === 0) {
            tbody.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tbody.style.display = '';
        emptyState.style.display = 'none';

        doacoes.forEach(doacao => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatarData(doacao.data)}</td>
                <td>${doacao.doador.nome}</td>
                <td><span class="donation-type type-${doacao.tipo}">${this.formatarTipo(doacao.tipo)}</span></td>
                <td>${this.formatarDescricao(doacao)}</td>
                <td>${this.formatarValor(doacao)}</td>
                <td><span class="donation-status status-${doacao.status}">${this.formatarStatus(doacao.status)}</span></td>
                <td>
                    <div class="donation-actions">
                        <button class="btn btn-sm btn-outline-primary btn-circle" 
                                onclick="doacoesManager.verDetalhes('${doacao.id}')"
                                title="Ver detalhes">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${doacao.status === 'pendente' ? `
                            <button class="btn btn-sm btn-outline-success btn-circle"
                                    onclick="doacoesManager.confirmarRecebimento('${doacao.id}')"
                                    title="Confirmar recebimento">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-circle"
                                    onclick="doacoesManager.cancelarDoacao('${doacao.id}')"
                                    title="Cancelar doação">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Atualizar estatísticas
    atualizarEstatisticas() {
        let totalMonetario = 0;
        let totalMateriais = 0;
        let totalAlimentos = 0;
        const doadores = new Set();

        this.doacoes.forEach(doacao => {
            if (doacao.status === 'recebida') {
                if (doacao.tipo === 'monetaria') {
                    totalMonetario += doacao.valor || 0;
                } else if (doacao.tipo === 'material') {
                    totalMateriais++;
                } else if (doacao.tipo === 'alimentos') {
                    totalAlimentos++;
                }
            }
            doadores.add(doacao.doador.nome);
        });

        (document.getElementById('totalMonetario').textContent = this.formatarMoeda(totalMonetario);
        (document.getElementById('totalMateriais').textContent = totalMateriais;
        (document.getElementById('totalAlimentos').textContent = totalAlimentos;
        (document.getElementById('totalDoadores').textContent = doadores.size;
    }

    // Aplicar filtros
    aplicarFiltros() {
        const searchTerm = (document.getElementById('searchInput').value.toLowerCase();
        const tipoFilter = (document.getElementById('tipoFilter').value;
        const statusFilter = (document.getElementById('statusFilter').value;
        const dataFilter = (document.getElementById('dataFilter').value;

        const doacoesFiltradas = this.doacoes.filter(doacao => {
            const matchSearch = doacao.doador.nome.toLowerCase().includes(searchTerm) ||
                              (doacao.observacoes || '').toLowerCase().includes(searchTerm);
            const matchTipo = !tipoFilter || doacao.tipo === tipoFilter;
            const matchStatus = !statusFilter || doacao.status === statusFilter;
            const matchData = !dataFilter || this.formatarData(doacao.data).includes(dataFilter);

            return matchSearch && matchTipo && matchStatus && matchData;
        });

        this.renderizarDoacoes(doacoesFiltradas);
    }

    // Limpar filtros
    limparFiltros() {
        (document.getElementById('searchInput').value = '';
        (document.getElementById('tipoFilter').value = '';
        (document.getElementById('statusFilter').value = '';
        (document.getElementById('dataFilter').value = '';
        this.renderizarDoacoes();
    }

    // Adicionar nova linha de item
    adicionarItemRow() {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <div class="flex-grow-1">
                <label class="form-label">Item</label>
                <input type="text" class="form-control item-nome" required>
            </div>
            <div style="width: 150px;">
                <label class="form-label">Quantidade</label>
                <input type="number" class="form-control item-quantidade" required min="1">
            </div>
            <div style="width: 40px;" class="d-flex align-items-end">
                <i class="bi bi-trash remove-item"></i>
            </div>
        `;
        (document.getElementById('itensList').appendChild(itemRow);
    }

    // Salvar nova doação
    async salvarDoacao() {
        try {
            const doacao = this.coletarDadosFormulario();
            const doacaoRef = await addDoc(collection(this.db, 'doacoes'), doacao);

            NotificationCenter.create({
                type: 'success',
                title: 'Sucesso',
                message: 'Doação registrada com sucesso!'
            });

            // Fechar modal e recarregar dados
            bootstrap.Modal.getInstance((document.getElementById('novaDoacaoModal')).hide();
            (document.getElementById('doacaoForm').reset();
            this.loadDoacoes();

        } catch (error) {
            console.error('Erro ao salvar doação:', error);
            NotificationCenter.create({
                type: 'danger',
                title: 'Erro',
                message: 'Não foi possível salvar a doação.'
            });
        }
    }

    // Coletar dados do formulário
    coletarDadosFormulario() {
        const tipo = (document.getElementById('doacaoTipo').value;
        const doacao = {
            doador: {
                nome: (document.getElementById('doadorNome').value,
                email: (document.getElementById('doadorEmail').value,
                telefone: (document.getElementById('doadorTelefone').value,
                documento: (document.getElementById('doadorDocumento').value
            },
            tipo: tipo,
            data: Timestamp.now(),
            status: 'pendente',
            observacoes: (document.getElementById('doacaoObs').value
        };

        if (tipo === 'monetaria') {
            doacao.valor = parseFloat((document.getElementById('doacaoValor').value) || 0;
        } else {
            doacao.itens = Array.from(document.querySelectorAll('.item-row')).map(row => ({
                nome: row.querySelector('.item-nome').value,
                quantidade: parseInt(row.querySelector('.item-quantidade').value) || 0
            }));
        }

        return doacao;
    }

    // Confirmar recebimento de doação
    async confirmarRecebimento(id) {
        try {
            const doacaoRef = doc(this.db, 'doacoes', id);
            await updateDoc(doacaoRef, {
                status: 'recebida',
                dataRecebimento: Timestamp.now()
            });

            NotificationCenter.create({
                type: 'success',
                title: 'Sucesso',
                message: 'Recebimento confirmado com sucesso!'
            });

            this.loadDoacoes();
        } catch (error) {
            console.error('Erro ao confirmar recebimento:', error);
            NotificationCenter.create({
                type: 'danger',
                title: 'Erro',
                message: 'Não foi possível confirmar o recebimento.'
            });
        }
    }

    // Cancelar doação
    async cancelarDoacao(id) {
        if (!confirm('Tem certeza que deseja cancelar esta doação?')) return;

        try {
            const doacaoRef = doc(this.db, 'doacoes', id);
            await updateDoc(doacaoRef, {
                status: 'cancelada',
                dataCancelamento: Timestamp.now()
            });

            NotificationCenter.create({
                type: 'warning',
                title: 'Doação Cancelada',
                message: 'A doação foi cancelada com sucesso.'
            });

            this.loadDoacoes();
        } catch (error) {
            console.error('Erro ao cancelar doação:', error);
            NotificationCenter.create({
                type: 'danger',
                title: 'Erro',
                message: 'Não foi possível cancelar a doação.'
            });
        }
    }

    // Ver detalhes da doação
    verDetalhes(id) {
        const doacao = this.doacoes.find(d => d.id === id);
        if (!doacao) return;

        // TODO: Implementar modal de detalhes
    }

    // Funções auxiliares de formatação
    formatarData(timestamp) {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleDateString('pt-BR');
    }

    formatarTipo(tipo) {
        const tipos = {
            monetaria: 'Monetária',
            material: 'Material',
            alimentos: 'Alimentos'
        };
        return tipos[tipo] || tipo;
    }

    formatarStatus(status) {
        const statusMap = {
            pendente: 'Pendente',
            recebida: 'Recebida',
            cancelada: 'Cancelada'
        };
        return statusMap[status] || status;
    }

    formatarDescricao(doacao) {
        if (doacao.tipo === 'monetaria') {
            return 'Doação em dinheiro';
        } else {
            return doacao.itens?.map(item => `${item.quantidade}x ${item.nome}`).join(', ') || '';
        }
    }

    formatarValor(doacao) {
        if (doacao.tipo === 'monetaria') {
            return this.formatarMoeda(doacao.valor);
        } else {
            return doacao.itens?.reduce((total, item) => total + item.quantidade, 0) + ' itens';
        }
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }
}

// Inicializar e expor globalmente
window.doacoesManager = new DoacoesManager();