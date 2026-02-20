/**
 * Serviço de API para o módulo de Doações
 * Centraliza todas as chamadas ao backend
 */
var DoacoesAPI = (function() {
    var BASE_URL = 'http://localhost:3003/api/doacoes';

    function getHeaders(isJson) {
        var token = localStorage.getItem('authToken');
        var headers = {};
        if (isJson) headers['Content-Type'] = 'application/json';
        if (token) headers['Authorization'] = 'Bearer ' + token;
        return headers;
    }

    async function listar(filtros) {
        var params = new URLSearchParams();
        if (filtros) {
            if (filtros.search) params.append('search', filtros.search);
            if (filtros.tipo) params.append('tipo', filtros.tipo);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
            if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
            if (filtros.page) params.append('page', filtros.page);
            if (filtros.limit) params.append('limit', filtros.limit);
        }
        var url = BASE_URL + (params.toString() ? '?' + params.toString() : '');
        var resp = await fetch(url, { headers: getHeaders(false) });
        if (!resp.ok) throw new Error('Erro ao listar doações');
        return resp.json();
    }

    async function criar(dados) {
        var usarFormData = dados instanceof FormData;
        var options = {
            method: 'POST',
            headers: usarFormData ? {} : getHeaders(true),
            body: usarFormData ? dados : JSON.stringify(dados)
        };
        // Para FormData, adicionar token manualmente
        if (usarFormData) {
            var token = localStorage.getItem('authToken');
            if (token) options.headers['Authorization'] = 'Bearer ' + token;
        }
        var resp = await fetch(BASE_URL, options);
        if (!resp.ok) {
            var errBody = await resp.json().catch(function() { return {}; });
            throw new Error(errBody.error || 'Erro ao criar doação');
        }
        return resp.json();
    }

    async function atualizarStatus(id, novoStatus) {
        var resp = await fetch(BASE_URL + '/' + id + '/status', {
            method: 'PATCH',
            headers: getHeaders(true),
            body: JSON.stringify({ status: novoStatus })
        });
        if (!resp.ok) {
            var errBody = await resp.json().catch(function() { return {}; });
            throw new Error(errBody.error || 'Erro ao atualizar status');
        }
        return resp.json();
    }

    async function confirmar(id) {
        var resp = await fetch(BASE_URL + '/' + id + '/confirmar', {
            method: 'PATCH',
            headers: getHeaders(true)
        });
        if (!resp.ok) throw new Error('Erro ao confirmar doação');
        return resp.json();
    }

    async function entregar(id) {
        var resp = await fetch(BASE_URL + '/' + id + '/entregar', {
            method: 'PATCH',
            headers: getHeaders(true)
        });
        if (!resp.ok) throw new Error('Erro ao entregar doação');
        return resp.json();
    }

    async function cancelar(id) {
        var resp = await fetch(BASE_URL + '/' + id + '/cancelar', {
            method: 'PATCH',
            headers: getHeaders(true)
        });
        if (!resp.ok) throw new Error('Erro ao cancelar doação');
        return resp.json();
    }

    return {
        listar: listar,
        criar: criar,
        atualizarStatus: atualizarStatus,
        confirmar: confirmar,
        entregar: entregar,
        cancelar: cancelar
    };
})();
