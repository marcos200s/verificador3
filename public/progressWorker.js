const { parentPort, workerData } = require('worker_threads');
const dolphinService = require('../services/dolphinService');

async function checkDomains() {
    const { domains, profileId } = workerData;
    
    try {
        // Criar nova aba no perfil específico
        const tab = await dolphinService.createTab(profileId);

        for (const domain of domains) {
            // Usar a aba criada para verificar o domínio
            // ... código de verificação ...

            // Enviar progresso
            parentPort.postMessage({
                type: 'progress',
                domain,
                result
            });
        }

        // Decrementar contagem de tabs ao finalizar
        parentPort.postMessage({
            type: 'tabClosed',
            profileId
        });

    } catch (error) {
        console.error('Erro no worker:', error);
        parentPort.postMessage({
            type: 'error',
            error: error.message
        });
    }
}

checkDomains(); 