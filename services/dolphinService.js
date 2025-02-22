const axios = require('axios');
const config = require('../config');

class DolphinService {
    constructor() {
        this.api = axios.create({
            baseURL: config.dolphin.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.dolphin.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Dolphin-Anty-Client'
            },
            timeout: 30000 // 30 segundos de timeout
        });
    }

    /**
     * Obter lista de perfis com filtros
     * @param {Object} params Parâmetros de filtro
     * @param {number} params.limit Quantidade de perfis por página (max 50)
     * @param {string} params.query Busca por nome do perfil
     * @param {string[]} params.tags Array de tags
     * @param {string[]} params.statuses Array de IDs de status
     * @param {string[]} params.mainWebsites Sites principais ['facebook', 'google', 'crypto', 'tiktok']
     * @param {number[]} params.users Array de IDs de usuários
     * @param {number} params.page Número da página
     */
    async getProfiles(params = {}) {
        try {
            console.log('Obtendo perfis do Dolphin Anty...');
            
            const response = await this.api.get('/browser_profiles', { params });
            console.log('Resposta:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao obter perfis:', {
                message: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Obter um perfil específico
     * @param {string} profileId ID do perfil
     */
    async getProfile(profileId) {
        const response = await this.api.get(`/browser_profiles/${profileId}`);
        return response.data;
    }

    /**
     * Iniciar um perfil
     * @param {string} profileId ID do perfil
     */
    async startProfile(profileId) {
        const response = await this.api.post(`/browser_profiles/${profileId}/start`);
        return response.data;
    }

    /**
     * Criar uma nova aba
     * @param {string} profileId ID do perfil
     */
    async createTab(profileId) {
        const response = await this.api.post(`/browser_profiles/${profileId}/tabs`);
        return response.data;
    }

    // Executar ação (endpoint da documentação)
    async executeAction(profileId, action) {
        const response = await this.api.post(`/action/${profileId}`, action);
        return response.data;
    }
}

module.exports = new DolphinService(); 