const { parentPort } = require('worker_threads');
const pLimit = require('p-limit');
const fetch = require('node-fetch');

// Configurações otimizadas
const CONCURRENT_LIMIT = 10; // 10 verificações simultâneas
const BATCH_SIZE = 5;        // 5 domínios por lote
const FETCH_TIMEOUT = 3000;  // 3 segundos

// Cache otimizado
const resultsCache = new Map();

// Função otimizada para verificar domínio
async function checkDomain(domain) {
    if (resultsCache.has(domain)) {
        return resultsCache.get(domain);
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`https://registro.br/v2/ajax/whois/${domain}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            signal: controller.signal,
            timeout: FETCH_TIMEOUT
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('API error');
        }

        const data = await response.json();
        const isAvailable = data.status === 'AVAILABLE';
        resultsCache.set(domain, isAvailable);
        return isAvailable;
    } catch (error) {
        // Em caso de erro, considera como indisponível
        return false;
    }
}

// Processamento otimizado em lotes
async function processDomainsParallel(domains) {
    const limit = pLimit(CONCURRENT_LIMIT);
    const results = [];
    let processed = 0;
    let available = 0;
    
    // Processa em lotes pequenos
    for (let i = 0; i < domains.length; i += BATCH_SIZE) {
        const batch = domains.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(domain => 
            limit(async () => {
                try {
                    const isAvailable = await checkDomain(domain.domain);
                    processed++;
                    if (isAvailable) available++;
                    
                    // Reporta progresso para cada domínio
                    parentPort.postMessage({
                        type: 'progress',
                        processed,
                        total: domains.length,
                        available
                    });

                    return {
                        ...domain,
                        available: isAvailable
                    };
                } catch (error) {
                    processed++;
                    return {
                        ...domain,
                        available: false,
                        error: true
                    };
                }
            })
        );

        // Processa lote atual
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}

// Listener de mensagens
parentPort.on('message', async ({ domains }) => {
    try {
        console.time('processamento');
        const results = await processDomainsParallel(domains);
        console.timeEnd('processamento');
        
        resultsCache.clear();
        
        parentPort.postMessage({ 
            type: 'complete', 
            results 
        });
    } catch (error) {
        console.error('Erro fatal:', error);
        parentPort.postMessage({ 
            type: 'error', 
            error: error.message || 'Erro no processamento'
        });
    }
});

// Tratamento de erros global
process.on('unhandledRejection', (error) => {
    console.error('Erro não tratado:', error);
    parentPort.postMessage({ 
        type: 'error', 
        error: 'Erro interno no processamento'
    });
}); 