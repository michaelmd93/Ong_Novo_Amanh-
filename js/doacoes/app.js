/**
 * Módulo principal de Doações
 * Orquestra API, Componentes e Validação
 */
var DoacoesApp = (function() {
    var doacoes = [];
    var canEdit = false;
    var sortColumn = 'data_doacao';
    var sortDirection = 'desc';
    var filtroTimeout = null;

    function init() {
        var userData = JSON.parse(localStorage.getItem('userData') || '{}');
        var userRole = (userData.cargo || 'guest').toLowerCase();
        canEdit = ['admin', 'secretaria'].includes(userRole);

        var btnNova = document.getElementById('btnNovaDoacao');
        if (btnNova && !canEdit) btnNova.style.display = 'none';

        // Coluna de ações no header
        var thAcoes = document.getElementById('thAcoes');
        if (thAcoes && !canEdit) thAcoes.style.display = 'none';

        setupFiltros();
        setupFormulario();
        setupOrdenacao();
        carregarDoacoes();
    }

    function setupFiltros() {
        var searchInput = document.getElementById('searchInput');
        var tipoFilter = document.getElementById('tipoFilter');
        var statusFilter = document.getElementById('statusFilter');
        var dataInicio = document.getElementById('dataInicio');
        var dataFim = document.getElementById('dataFim');
        var limpar = document.getElementById('limparFiltros');

        var dispararFiltro = function() {
            if (filtroTimeout) clearTimeout(filtroTimeout);
            filtroTimeout = setTimeout(function() { carregarDoacoes(); }, 250);
        };

        if (searchInput) searchInput.addEventListener('input', dispararFiltro);
        if (tipoFilter) tipoFilter.addEventListener('change', dispararFiltro);
        if (statusFilter) statusFilter.addEventListener('change', dispararFiltro);
        if (dataInicio) dataInicio.addEventListener('change', dispararFiltro);
        if (dataFim) dataFim.addEventListener('change', dispararFiltro);
        if (limpar) limpar.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (tipoFilter) tipoFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            if (dataInicio) dataInicio.value = '';
            if (dataFim) dataFim.value = '';
            carregarDoacoes();
        });
    }

    function setupFormulario() {
        var tipoSelect = document.getElementById('doacaoTipo');
        var valorField = document.getElementById('valorField');
        var pagamentoField = document.getElementById('pagamentoField');
        var comprovanteField = document.getElementById('comprovanteField');
        var quantidadeField = document.getElementById('quantidadeField');
        var descricaoField = document.getElementById('descricaoField');
        var valorInput = document.getElementById('doacaoValor');

        if (tipoSelect) {
            tipoSelect.addEventListener('change', function(e) {
                var tipo = e.target.value;
                var isDinheiro = tipo === 'dinheiro';
                var isItem = tipo && !isDinheiro;

                if (valorField) valorField.style.display = isDinheiro ? 'block' : 'none';
                if (pagamentoField) pagamentoField.style.display = isDinheiro ? 'block' : 'none';
                if (comprovanteField) comprovanteField.style.display = isDinheiro ? 'block' : 'none';
                if (quantidadeField) quantidadeField.style.display = isItem ? 'block' : 'none';
                if (descricaoField) descricaoField.style.display = isItem ? 'block' : 'none';
            });
        }

        // Máscara de moeda
        if (valorInput) {
            valorInput.addEventListener('input', function(e) {
                var v = e.target.value.replace(/\D/g, '');
                if (!v) { e.target.value = ''; return; }
                while (v.length < 3) v = '0' + v;
                var inteiro = v.slice(0, -2);
                var centavos = v.slice(-2);
                e.target.value = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + centavos;
            });
        }

        var salvarBtn = document.getElementById('salvarDoacao');
        if (salvarBtn) salvarBtn.addEventListener('click', salvarDoacao);
    }

    function setupOrdenacao() {
        var headers = document.querySelectorAll('th[data-sort]');
        headers.forEach(function(th) {
            th.style.cursor = 'pointer';
            th.addEventListener('click', function() {
                var col = th.getAttribute('data-sort');
                if (sortColumn === col) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = col;
                    sortDirection = 'asc';
                }
                // Atualizar indicadores visuais
                headers.forEach(function(h) {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                ordenarERenderizar();
            });
        });
    }

    function getFiltros() {
        return {
            search: (document.getElementById('searchInput') || {}).value || '',
            tipo: (document.getElementById('tipoFilter') || {}).value || '',
            status: (document.getElementById('statusFilter') || {}).value || '',
            data_inicio: (document.getElementById('dataInicio') || {}).value || '',
            data_fim: (document.getElementById('dataFim') || {}).value || ''
        };
    }

    async function carregarDoacoes() {
        try {
            var filtros = getFiltros();
            var data = await DoacoesAPI.listar(filtros);
            doacoes = data.doacoes || data || [];
            ordenarERenderizar();
        } catch (err) {
            console.warn('Erro ao carregar doações:', err);
            doacoes = [];
            DoacoesComponents.renderizarTabela([], canEdit);
            DoacoesComponents.atualizarEstatisticas([]);
        }
    }

    function ordenarERenderizar() {
        var lista = doacoes.slice();

        lista.sort(function(a, b) {
            var va, vb;
            switch (sortColumn) {
                case 'data_doacao':
                    va = a.data_doacao || '';
                    vb = b.data_doacao || '';
                    break;
                case 'nome_doador':
                    va = (a.nome_doador || '').toLowerCase();
                    vb = (b.nome_doador || '').toLowerCase();
                    break;
                case 'tipo':
                    va = a.tipo || '';
                    vb = b.tipo || '';
                    break;
                case 'valor':
                    va = parseFloat(a.valor) || 0;
                    vb = parseFloat(b.valor) || 0;
                    break;
                case 'status':
                    va = a.status || '';
                    vb = b.status || '';
                    break;
                default:
                    va = a[sortColumn] || '';
                    vb = b[sortColumn] || '';
            }
            var cmp = 0;
            if (va < vb) cmp = -1;
            else if (va > vb) cmp = 1;
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        DoacoesComponents.renderizarTabela(lista, canEdit);
        DoacoesComponents.atualizarEstatisticas(doacoes);
    }

    async function salvarDoacao() {
        var tipoEl = document.getElementById('doacaoTipo');
        var doadorEl = document.getElementById('doadorNome');
        var valorEl = document.getElementById('doacaoValor');
        var quantidadeEl = document.getElementById('doacaoQuantidade');
        var descricaoEl = document.getElementById('doacaoDescricao');
        var observacoesEl = document.getElementById('doacaoObservacoes');
        var pagamentoEl = document.getElementById('formaPagamento');
        var comprovanteEl = document.getElementById('doacaoComprovante');

        var tipo = tipoEl ? tipoEl.value : '';
        var nomeDoador = doadorEl ? doadorEl.value.trim() : '';

        // Converter valor formatado
        var valorBruto = valorEl ? valorEl.value.trim() : '';
        var valor = 0;
        if (valorBruto) {
            valor = parseFloat(valorBruto.replace(/\./g, '').replace(',', '.')) || 0;
        }

        var dados = {
            nome_doador: nomeDoador,
            tipo: tipo,
            valor: tipo === 'dinheiro' ? valor : 0,
            quantidade: quantidadeEl ? parseInt(quantidadeEl.value) || 0 : 0,
            descricao_itens: descricaoEl ? descricaoEl.value.trim() : '',
            observacoes: observacoesEl ? observacoesEl.value.trim() : '',
            forma_pagamento: pagamentoEl ? pagamentoEl.value : ''
        };

        // Validação
        var erros = DoacoesValidation.validarDoacao(dados);
        var comprovanteFile = comprovanteEl && comprovanteEl.files.length ? comprovanteEl.files[0] : null;
        if (comprovanteFile) {
            erros = erros.concat(DoacoesValidation.validarComprovante(comprovanteFile));
        }

        if (erros.length > 0) {
            DoacoesComponents.mostrarMensagem(erros.join('<br>'), 'danger');
            return;
        }

        // Montar payload (FormData se tiver comprovante, JSON se não)
        var payload;
        if (comprovanteFile) {
            payload = new FormData();
            payload.append('nome_doador', dados.nome_doador);
            payload.append('tipo', dados.tipo);
            payload.append('valor', dados.valor);
            payload.append('quantidade', dados.quantidade);
            payload.append('descricao_itens', dados.descricao_itens);
            payload.append('observacoes', dados.observacoes);
            payload.append('forma_pagamento', dados.forma_pagamento);
            payload.append('comprovante', comprovanteFile);
        } else {
            payload = dados;
        }

        try {
            await DoacoesAPI.criar(payload);
            DoacoesComponents.mostrarMensagem('Doação registrada com sucesso!', 'success');
            limparFormulario();
            // Fechar modal
            var modalEl = document.getElementById('novaDoacaoModal');
            if (modalEl && window.bootstrap) {
                var modal = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
                modal.hide();
            }
            carregarDoacoes();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            DoacoesComponents.mostrarMensagem('Erro ao salvar doação: ' + err.message, 'danger');
        }
    }

    function limparFormulario() {
        var form = document.getElementById('doacaoForm');
        if (form) form.reset();
        ['valorField', 'pagamentoField', 'comprovanteField', 'quantidadeField', 'descricaoField'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    async function mudarStatus(id, novoStatus) {
        var nomes = { recebida: 'confirmar recebimento', entregue: 'marcar como entregue', cancelada: 'cancelar' };
        var confirmMsg = 'Deseja realmente ' + (nomes[novoStatus] || 'alterar') + ' esta doação?';
        if (!confirm(confirmMsg)) return;

        try {
            await DoacoesAPI.atualizarStatus(id, novoStatus);
            DoacoesComponents.mostrarMensagem('Status atualizado com sucesso!', 'success');
            carregarDoacoes();
        } catch (err) {
            DoacoesComponents.mostrarMensagem('Erro: ' + err.message, 'danger');
        }
    }

    // Exportar PDF (placeholder - usando window.print por enquanto)
    function exportarPDF() {
        window.print();
    }

    // Exportar Excel (CSV)
    function exportarExcel() {
        if (!doacoes.length) {
            DoacoesComponents.mostrarMensagem('Nenhuma doação para exportar.', 'warning');
            return;
        }
        var header = 'Data;Doador;Tipo;Valor;Quantidade;Descricao;Status;Observacoes\n';
        var linhas = doacoes.map(function(d) {
            return [
                DoacoesComponents.formatarData(d.data_doacao),
                d.nome_doador || '',
                d.tipo || '',
                d.valor || 0,
                d.quantidade || '',
                (d.descricao_itens || '').replace(/;/g, ','),
                d.status || '',
                (d.observacoes || '').replace(/;/g, ',')
            ].join(';');
        }).join('\n');

        var bom = '\uFEFF';
        var blob = new Blob([bom + header + linhas], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'doacoes_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        DoacoesComponents.mostrarMensagem('Relatório exportado com sucesso!', 'success');
    }

    return {
        init: init,
        carregarDoacoes: carregarDoacoes,
        mudarStatus: mudarStatus,
        exportarPDF: exportarPDF,
        exportarExcel: exportarExcel
    };
})();

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    DoacoesApp.init();
});
