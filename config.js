const config = {
    api: {
        baseUrl: 'https://registro.br/v2/ajax/avail/raw',  // Esta é a URL correta do registro.br
        requestDelay: 2000 // Aumentado para 2 segundos
    },
    server: {
        port: process.env.PORT || 3000
    },
    // Configuração para armazenamento temporário na Vercel
    tempStorage: '/tmp',
    dolphin: {
        apiKey: process.env.DOLPHIN_API_KEY,
        baseUrl: 'https://dolphin-anty-api.com',  // URL correta da API
    },
};

module.exports = config;