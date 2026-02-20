class DoacoesManager {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3003/api';
        this.doacoes = [];
        this.ultimoId = 1;
        this.filtroTimeout = null;
        this._filtrando = false;
        this.setupEventListeners();
        this.carregarDoacoesIniciais();
    }

    setupEventListeners() {
        var userData = JSON.parse(localStorage.getItem('userData') || '{}');
        var userRole = (userData.cargo || 'guest').toLowerCase();
        var canEdit = ['admin', 'secretaria'].includes(userRole);

        var btnNova = document.getElementById('btnNovaDoacao');
        if (btnNova && !canEdit) {
            btnNova.remove();
        }

        var searchInput = document.getElementById('searchInput');
        var tipoFilter = document.getElementById('tipoFilter');
        var dataFilter = document.getElementById('dataFilter');
        var limparFiltros = document.getElementById('limparFiltros');
        var tipoOrdenacao = document.getElementById('ordenacaoSelect');
        var self = this;

        var dispararFiltros = function() { self.dispararAplicarFiltros(); };

        if (searchInput) searchInput.addEventListener('input', dispararFiltros);
        if (tipoFilter) tipoFilter.addEventListener('change', dispararFiltros);
        if (dataFilter) dataFilter.addEventListener('change', dispararFiltros);
        if (tipoOrdenacao) tipoOrdenacao.addEventListener('change', dispararFiltros);
        if (limparFiltros) limparFiltros.addEventListener('click', function() {
            self.limparFiltros();
        });

        var tipoDoacao = document.getElementById('doacaoTipo');
        var valorField = document.getElementById('valorField');
        var quantidadeField = document.getElementById('quantidadeField');
        var descricaoField = document.getElementById('descricaoField');
        var valorInput = document.getElementById('doacaoValor');

        if (tipoDoacao) {
            tipoDoacao.addEventListener('change', function(e) {
                var tipo = e.target.value;
                if (tipo === 'dinheiro') {
                    // Dinheiro: mostrar valor, esconder quantidade e descricao
                    if (valorField) valorField.style.display = 'block';
                    if (quantidadeField) quantidadeField.style.display = 'none';
                    if (descricaoField) descricaoField.style.display = 'none';
                } else if (tipo) {
                    // Outros tipos: mostrar quantidade e descricao, esconder valor
                    if (valorField) valorField.style.display = 'none';
                    if (quantidadeField) quantidadeField.style.display = 'block';
                    if (descricaoField) descricaoField.style.display = 'block';
                } else {
                    // Nenhum selecionado: esconder tudo
                    if (valorField) valorField.style.display = 'none';
                    if (quantidadeField) quantidadeField.style.display = 'none';
                    if (descricaoField) descricaoField.style.display = 'none';
                }
            });
        }

        if (valorInput) {
            valorInput.addEventListener('input', function(e) {
                var v = e.target.value;
                v = v.replace(/\D/g, '');
                if (!v) { e.target.value = ''; return; }
                while (v.length < 3) { v = '0' + v; }
                var inteiro = v.slice(0, -2);
                var centavos = v.slice(-2);
                var inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                e.target.value = inteiroFormatado + ',' + centavos;
            });
        }

        var salvarBtn = document.getElementById('salvarDoacao');
        if (salvarBtn) salvarBtn.addEventListener('click', function() { self.salvarDoacao(); });
    }

    async carregarDoacoesIniciais() {
        try {
            var token = localStorage.getItem('authToken');
            var headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;

            var resp = await fetch(this.API_BASE_URL + '/doacoes', { headers: headers });
            if (!resp.ok) throw new Error('Falha ao carregar doações');
            var data = await resp.json();
            var doacoesList = data.doacoes || data;
            var self = this;

            if (Array.isArray(doacoesList)) {
                this.doacoes = doacoesList.map(function(item, index) {
                    return {
                        id: item.id || index + 1,
                        tipo: self.mapearTipoBackendParaUI(item.tipo),
                        valor: item.valor !== undefined ? item.valor : null,
                        quantidade: item.quantidade || null,
                        descricao: item.descricao_itens || item.observacoes || '',
                        doador: item.nome_doador || '',
                        dataCadastro: item.data_doacao ? new Date(item.data_doacao) : new Date()
                    };
                });

                var maiorId = this.doacoes.reduce(function(max, d) { return Math.max(max, d.id || 0); }, 0);
                this.ultimoId = maiorId > 0 ? maiorId + 1 : 1;
            }
        } catch (err) {
            console.warn('Nao foi possivel carregar doacoes do backend.', err);
        } finally {
            this.renderizarDoacoes();
            this.atualizarEstatisticas();
        }
    }

    mapearTipoBackendParaUI(tipoBackend) {
        switch (tipoBackend) {
            case 'dinheiro': return 'dinheiro';
            case 'alimentos': return 'alimento';
            case 'materiais_escolares': return 'material_escolar';
            case 'materiais_higiene': return 'higiene';
            default: return 'outros';
        }
    }

    mapearTipoUIParaBackend(tipoUI) {
        switch (tipoUI) {
            case 'dinheiro': return 'dinheiro';
            case 'alimento': return 'alimentos';
            case 'material_escolar': return 'materiais_escolares';
            case 'higiene': return 'materiais_higiene';
            default: return 'outros';
        }
    }

    async salvarDoacao() {
        var tipoEl = document.getElementById('doacaoTipo');
        var valorInput = document.getElementById('doacaoValor');
        var quantidadeInput = document.getElementById('doacaoQuantidade');
        var descricaoInput = document.getElementById('doacaoDescricao');
        var doadorInput = document.getElementById('doadorNome');

        var tipo = tipoEl ? tipoEl.value : '';

        if (!tipo) {
            this.mostrarMensagem('Selecione o tipo de doação.', 'danger');
            return;
        }

        var doador = doadorInput ? doadorInput.value.trim() : '';
        if (!doador) {
            this.mostrarMensagem('Informe o nome do doador.', 'danger');
            return;
        }

        var valor = 0;
        var quantidade = 0;
        var descricao = '';

        if (tipo === 'dinheiro') {
            // Dinheiro: precisa de valor
            var bruto = valorInput ? valorInput.value.toString().trim() : '';
            if (bruto) {
                bruto = bruto.replace(/\./g, '').replace(',', '.');
                valor = parseFloat(bruto) || 0;
            }
            if (valor <= 0) {
                this.mostrarMensagem('Informe um valor em dinheiro válido.', 'danger');
                return;
            }
        } else {
            // Outros tipos: precisa de quantidade e descricao
            quantidade = quantidadeInput ? parseInt(quantidadeInput.value) || 0 : 0;
            descricao = descricaoInput ? descricaoInput.value.trim() : '';

            if (quantidade <= 0) {
                this.mostrarMensagem('Informe a quantidade doada.', 'danger');
                return;
            }
            if (!descricao) {
                this.mostrarMensagem('Descreva o que foi doado.', 'danger');
                return;
            }
        }

        var tipoBackend = this.mapearTipoUIParaBackend(tipo);

        // Montar descrição completa com quantidade
        var descricaoCompleta = descricao;
        if (quantidade > 0) {
            descricaoCompleta = quantidade + 'x - ' + descricao;
        }

        var payload = {
            nome_doador: doador,
            tipo: tipoBackend,
            valor: valor,
            descricao_itens: descricaoCompleta
        };

        try {
            var token = localStorage.getItem('authToken');
            var headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            var resp = await fetch(this.API_BASE_URL + '/doacoes', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                var errData = await resp.json().catch(function() { return {}; });
                console.error('Erro backend:', errData);
                throw new Error('Erro ao salvar doacao');
            }

            var criada = await resp.json();
            var doacaoObj = criada.doacao || criada;

            var doacao = {
                id: doacaoObj.id || this.ultimoId++,
                tipo: tipo,
                valor: valor,
                quantidade: quantidade,
                descricao: descricaoCompleta,
                doador: doador,
                dataCadastro: doacaoObj.data_doacao ? new Date(doacaoObj.data_doacao) : new Date()
            };

            this.doacoes.push(doacao);
            this.limparFormulario();
            this.renderizarDoacoes();
            this.atualizarEstatisticas();
            this.mostrarMensagem('Doação registrada com sucesso!', 'success');

            var modalEl = document.getElementById('novaDoacaoModal');
            if (modalEl && window.bootstrap) {
                var modal = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
                modal.hide();
            }
        } catch (err) {
            console.error('Erro ao salvar doacao:', err);
            this.mostrarMensagem('Não foi possível salvar a doação. Tente novamente.', 'danger');
        }
    }

    limparFormulario() {
        var form = document.getElementById('doacaoForm');
        if (form) form.reset();

        var valorField = document.getElementById('valorField');
        var quantidadeField = document.getElementById('quantidadeField');
        var descricaoField = document.getElementById('descricaoField');
        if (valorField) valorField.style.display = 'none';
        if (quantidadeField) quantidadeField.style.display = 'none';
        if (descricaoField) descricaoField.style.display = 'none';
    }

    aplicarFiltros() {
        if (this._filtrando) return;
        this._filtrando = true;

        var searchEl = document.getElementById('searchInput');
        var tipoEl = document.getElementById('tipoFilter');
        var dataEl = document.getElementById('dataFilter');
        var ordenacaoEl = document.getElementById('ordenacaoSelect');

        var searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
        var tipoFilter = tipoEl ? tipoEl.value : '';
        var dataFilter = dataEl ? dataEl.value : '';
        var ordenacao = ordenacaoEl ? ordenacaoEl.value : '';

        var self = this;
        var resultado = this.doacoes.filter(function(d) {
            var texto = ((d.doador || '') + ' ' + (d.descricao || '')).toLowerCase();
            var matchSearch = !searchTerm || texto.indexOf(searchTerm) !== -1;
            var matchTipo = !tipoFilter || d.tipo === tipoFilter;
            var matchData = true;
            if (dataFilter) {
                var dataStr = self.formatarData(d.dataCadastro, true);
                matchData = dataStr === dataFilter;
            }
            return matchSearch && matchTipo && matchData;
        });

        if (ordenacao) {
            resultado = this.ordenar(resultado, ordenacao);
        }

        this.renderizarDoacoes(resultado);
        this._filtrando = false;
    }

    ordenar(lista, criterio) {
        var copia = lista.slice();
        switch (criterio) {
            case 'dataRecente':
                copia.sort(function(a, b) { return b.dataCadastro - a.dataCadastro; });
                break;
            case 'dataAntiga':
                copia.sort(function(a, b) { return a.dataCadastro - b.dataCadastro; });
                break;
            case 'nomeAZ':
                copia.sort(function(a, b) { return (a.doador || '').localeCompare(b.doador || ''); });
                break;
            case 'nomeZA':
                copia.sort(function(a, b) { return (b.doador || '').localeCompare(a.doador || ''); });
                break;
            case 'valorMaior':
                copia.sort(function(a, b) { return (b.valor || 0) - (a.valor || 0); });
                break;
            case 'valorMenor':
                copia.sort(function(a, b) { return (a.valor || 0) - (b.valor || 0); });
                break;
        }
        return copia;
    }

    limparFiltros() {
        var searchInput = document.getElementById('searchInput');
        var tipoFilter = document.getElementById('tipoFilter');
        var dataFilter = document.getElementById('dataFilter');
        var ordenacao = document.getElementById('ordenacaoSelect');

        if (searchInput) searchInput.value = '';
        if (tipoFilter) tipoFilter.value = '';
        if (dataFilter) dataFilter.value = '';
        if (ordenacao) ordenacao.value = '';

        this.renderizarDoacoes(this.doacoes);
    }

    renderizarDoacoes(lista) {
        var tbody = document.getElementById('doacoesTableBody');
        var emptyState = document.getElementById('emptyState');
        var doacoes = lista || this.doacoes;

        if (!tbody) return;
        tbody.innerHTML = '';

        if (!doacoes.length) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        var self = this;
        doacoes.forEach(function(d) {
            var tr = document.createElement('tr');
            var dataStr = self.formatarData(d.dataCadastro);
            var doadorStr = d.doador || '-';
            var tipoStr = self.formatarTipo(d.tipo);
            var descStr = d.descricao || '-';
            var valorQtdStr = '';

            if (d.tipo === 'dinheiro') {
                valorQtdStr = self.formatarMoeda(d.valor);
            } else {
                valorQtdStr = descStr;
            }

            tr.innerHTML =
                '<td>' + dataStr + '</td>' +
                '<td>' + doadorStr + '</td>' +
                '<td>' + tipoStr + '</td>' +
                '<td>' + valorQtdStr + '</td>';
            tbody.appendChild(tr);
        });
    }

    formatarData(data, formatoInput) {
        if (!(data instanceof Date) || isNaN(data.getTime())) return '';
        var ano = data.getFullYear();
        var mes = String(data.getMonth() + 1).padStart(2, '0');
        var dia = String(data.getDate()).padStart(2, '0');
        if (formatoInput) {
            return ano + '-' + mes + '-' + dia;
        }
        return dia + '/' + mes + '/' + ano;
    }

    formatarTipo(tipo) {
        switch (tipo) {
            case 'dinheiro': return 'Dinheiro';
            case 'alimento': return 'Alimento';
            case 'material_escolar': return 'Material escolar';
            case 'higiene': return 'Produtos de higiene';
            case 'outros': return 'Outros';
            default: return tipo;
        }
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }

    dispararAplicarFiltros() {
        if (this.filtroTimeout) {
            clearTimeout(this.filtroTimeout);
        }
        var self = this;
        this.filtroTimeout = setTimeout(function() {
            self.aplicarFiltros();
        }, 150);
    }

    mostrarMensagem(texto, tipo) {
        tipo = tipo || 'info';
        var container = document.querySelector('.doacoes-toast');
        if (!container) {
            container = document.createElement('div');
            container.className = 'doacoes-toast';
            document.body.appendChild(container);
        }

        var alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-' + tipo + ' alert-dismissible fade show mb-2';
        alertDiv.innerHTML = texto + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
        container.appendChild(alertDiv);

        setTimeout(function() {
            alertDiv.classList.remove('show');
            alertDiv.classList.add('hide');
            setTimeout(function() { alertDiv.remove(); }, 300);
        }, 4000);
    }

    atualizarEstatisticas() {
        var totalDoacoes = this.doacoes.length;
        var totalDinheiro = 0;
        var totalItens = 0;
        var doadores = {};

        for (var i = 0; i < this.doacoes.length; i++) {
            var d = this.doacoes[i];
            if (d.tipo === 'dinheiro') {
                totalDinheiro += parseFloat(d.valor) || 0;
            } else {
                totalItens++;
            }
            if (d.doador) doadores[d.doador] = true;
        }

        var totalDoadores = Object.keys(doadores).length;

        var elTotalDoacoes = document.getElementById('totalDoacoes');
        var elTotalDinheiro = document.getElementById('totalDinheiro');
        var elTotalItens = document.getElementById('totalItens');
        var elTotalDoadores = document.getElementById('totalDoadores');

        if (elTotalDoacoes) elTotalDoacoes.textContent = totalDoacoes;
        if (elTotalDinheiro) elTotalDinheiro.textContent = this.formatarMoeda(totalDinheiro);
        if (elTotalItens) elTotalItens.textContent = totalItens;
        if (elTotalDoadores) elTotalDoadores.textContent = totalDoadores;
    }
}

if (!window.__doacoesManagerInitialized__) {
    window.__doacoesManagerInitialized__ = true;
    document.addEventListener('DOMContentLoaded', function() {
        window.doacoesManager = new DoacoesManager();
    });
}
