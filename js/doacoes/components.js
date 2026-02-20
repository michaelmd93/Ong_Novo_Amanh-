/**
 * Componentes visuais para o módulo de Doações
 * Badges, formatação, renderização de tabela
 */
var DoacoesComponents = (function() {

    // Mapa de badges por tipo
    var tipoBadges = {
        'alimentos':     { label: 'Alimentos',     classe: 'bg-success' },
        'vestuario':     { label: 'Vestuário',     classe: 'bg-info' },
        'higiene':       { label: 'Higiene',        classe: 'bg-warning text-dark' },
        'medicamentos':  { label: 'Medicamentos',  classe: 'bg-danger' },
        'enxoval':       { label: 'Enxoval',        classe: 'bg-secondary' },
        'dinheiro':      { label: 'Dinheiro',       classe: 'bg-primary' },
        'outros':        { label: 'Outros',         classe: 'bg-dark' }
    };

    // Mapa de badges por status
    var statusBadges = {
        'pendente':  { label: 'Pendente',  classe: 'bg-warning text-dark' },
        'recebida':  { label: 'Recebida',  classe: 'bg-success' },
        'entregue':  { label: 'Entregue',  classe: 'bg-primary' },
        'cancelada': { label: 'Cancelada', classe: 'bg-danger' }
    };

    var formaPagamentoLabels = {
        'pix': 'Pix',
        'transferencia': 'Transferência',
        'dinheiro': 'Dinheiro',
        'cartao': 'Cartão'
    };

    function badgeTipo(tipo) {
        var badge = tipoBadges[tipo] || { label: tipo, classe: 'bg-secondary' };
        return '<span class="badge ' + badge.classe + '">' + badge.label + '</span>';
    }

    function badgeStatus(status) {
        var badge = statusBadges[status] || { label: status, classe: 'bg-secondary' };
        return '<span class="badge ' + badge.classe + '">' + badge.label + '</span>';
    }

    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }

    function formatarData(dataStr) {
        if (!dataStr) return '-';
        var d = new Date(dataStr + 'T00:00:00');
        if (isNaN(d.getTime())) return dataStr;
        var dia = String(d.getDate()).padStart(2, '0');
        var mes = String(d.getMonth() + 1).padStart(2, '0');
        var ano = d.getFullYear();
        return dia + '/' + mes + '/' + ano;
    }

    function detalheDoacao(d) {
        if (d.tipo === 'dinheiro') {
            var txt = formatarMoeda(d.valor);
            if (d.forma_pagamento) {
                txt += ' <small class="text-muted">(' + (formaPagamentoLabels[d.forma_pagamento] || d.forma_pagamento) + ')</small>';
            }
            return txt;
        }
        var partes = [];
        if (d.quantidade) partes.push(d.quantidade + 'x');
        if (d.descricao_itens) partes.push(d.descricao_itens);
        return partes.length ? partes.join(' - ') : '-';
    }

    function renderizarLinha(d, canEdit) {
        var acoes = '';
        if (canEdit) {
            acoes = '<div class="dropdown">' +
                '<button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end">';
            if (d.status === 'pendente') {
                acoes += '<li><a class="dropdown-item text-success" href="#" onclick="DoacoesApp.mudarStatus(' + d.id + ',\'recebida\')"><i class="bi bi-check-circle me-2"></i>Confirmar Recebida</a></li>';
            }
            if (d.status === 'recebida') {
                acoes += '<li><a class="dropdown-item text-primary" href="#" onclick="DoacoesApp.mudarStatus(' + d.id + ',\'entregue\')"><i class="bi bi-truck me-2"></i>Marcar Entregue</a></li>';
            }
            if (d.status !== 'cancelada') {
                acoes += '<li><hr class="dropdown-divider"></li>';
                acoes += '<li><a class="dropdown-item text-danger" href="#" onclick="DoacoesApp.mudarStatus(' + d.id + ',\'cancelada\')"><i class="bi bi-x-circle me-2"></i>Cancelar</a></li>';
            }
            acoes += '</ul></div>';
        }

        return '<tr>' +
            '<td>' + formatarData(d.data_doacao) + '</td>' +
            '<td>' + (d.nome_doador || '-') + '</td>' +
            '<td>' + badgeTipo(d.tipo) + '</td>' +
            '<td>' + detalheDoacao(d) + '</td>' +
            '<td>' + badgeStatus(d.status) + '</td>' +
            '<td class="text-truncate" style="max-width:150px" title="' + (d.observacoes || '') + '">' + (d.observacoes || '-') + '</td>' +
            (canEdit ? '<td class="text-center">' + acoes + '</td>' : '') +
            '</tr>';
    }

    function renderizarTabela(doacoes, canEdit) {
        var tbody = document.getElementById('doacoesTableBody');
        var emptyState = document.getElementById('emptyState');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!doacoes || !doacoes.length) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        for (var i = 0; i < doacoes.length; i++) {
            tbody.innerHTML += renderizarLinha(doacoes[i], canEdit);
        }
    }

    function atualizarEstatisticas(doacoes) {
        var totalDoacoes = doacoes.length;
        var totalDinheiro = 0;
        var totalItens = 0;
        var doadores = {};

        for (var i = 0; i < doacoes.length; i++) {
            var d = doacoes[i];
            if (d.tipo === 'dinheiro') {
                totalDinheiro += parseFloat(d.valor) || 0;
            } else {
                totalItens += parseInt(d.quantidade) || 1;
            }
            if (d.nome_doador) doadores[d.nome_doador] = true;
        }

        var el1 = document.getElementById('totalDoacoes');
        var el2 = document.getElementById('totalDinheiro');
        var el3 = document.getElementById('totalItens');
        var el4 = document.getElementById('totalDoadores');

        if (el1) el1.textContent = totalDoacoes;
        if (el2) el2.textContent = formatarMoeda(totalDinheiro);
        if (el3) el3.textContent = totalItens;
        if (el4) el4.textContent = Object.keys(doadores).length;
    }

    function mostrarMensagem(texto, tipo) {
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

    return {
        badgeTipo: badgeTipo,
        badgeStatus: badgeStatus,
        formatarMoeda: formatarMoeda,
        formatarData: formatarData,
        detalheDoacao: detalheDoacao,
        renderizarTabela: renderizarTabela,
        atualizarEstatisticas: atualizarEstatisticas,
        mostrarMensagem: mostrarMensagem
    };
})();
