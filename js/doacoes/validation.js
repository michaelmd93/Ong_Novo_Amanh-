/**
 * Validação de formulário para o módulo de Doações
 */
var DoacoesValidation = (function() {

    function validarDoacao(dados) {
        var erros = [];

        if (!dados.nome_doador || dados.nome_doador.trim().length < 2) {
            erros.push('Nome do doador deve ter pelo menos 2 caracteres.');
        }

        if (!dados.tipo) {
            erros.push('Selecione o tipo de doação.');
        }

        if (dados.tipo === 'dinheiro') {
            if (!dados.valor || parseFloat(dados.valor) <= 0) {
                erros.push('Informe um valor em dinheiro válido.');
            }
            if (!dados.forma_pagamento) {
                erros.push('Selecione a forma de pagamento.');
            }
        } else if (dados.tipo) {
            if (!dados.quantidade || parseInt(dados.quantidade) <= 0) {
                erros.push('Informe a quantidade doada.');
            }
            if (!dados.descricao_itens || dados.descricao_itens.trim().length === 0) {
                erros.push('Descreva os itens doados.');
            }
        }

        if (dados.observacoes && dados.observacoes.length > 1000) {
            erros.push('Observações devem ter no máximo 1000 caracteres.');
        }

        return erros;
    }

    function validarComprovante(file) {
        if (!file) return [];
        var erros = [];
        var tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!tiposPermitidos.includes(file.type)) {
            erros.push('Tipo de arquivo não permitido. Use: JPG, PNG, GIF, WEBP ou PDF.');
        }
        if (file.size > 5 * 1024 * 1024) {
            erros.push('Arquivo deve ter no máximo 5MB.');
        }
        return erros;
    }

    return {
        validarDoacao: validarDoacao,
        validarComprovante: validarComprovante
    };
})();
