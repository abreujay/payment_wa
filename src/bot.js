const wa = require('@open-wa/wa-automate');
const axios = require('axios');

const initialize = async () => {
    try {
        const client = await wa.create({
            sessionId: "Payment_JA",
            multiDevice: true,
            authTimeout: 60,
            blockCrashLogs: true,
            disableSpins: true,
            headless: true,
            hostNotificationLang: 'PT_BR',
            logConsole: false,
            popup: true,
            qrTimeout: 0,
        });

        start(client);
    } catch (error) {

        console.error('Ocorreu Um Erro Ao Iniciar O Cliente', error);
    
    }
};

const start = (client) => {
    let userEmail = null; 
    let userValue = null;

    client.onMessage(async (message) => {
        if (message.body === '/pagar') {
            await client.sendText(message.from, 'Digite seu e-mail:');
        } else if (userEmail === null && message.body.includes('@')) {
            userEmail = message.body;
            await client.sendText(message.from, 'Digite o valor:');
        } else if (userEmail !== null && userValue === null) {
            userValue = message.body;
            await client.sendText(message.from, `Recebido! E-mail: ${userEmail}, Valor: R$ ${userValue}`);
            
            try {
                const response = await axios.post('http://localhost:3000/donate', {
                    email: userEmail,
                    valor: userValue
                });

                if (response.status === 200) {
                    const paymentCode = response.data.qrCodeData; 
                    await client.sendText(message.from, `Código para pagamento gerado: ${paymentCode}`); 
                }
            } catch (error) {
                console.error('Ocorreu Um Erro Ao Gerar Código de Pagamento:', error);
                await client.sendText(message.from, 'Ocorreu um erro ao gerar o código de pagamento. Tente novamente.');
            }

            userEmail = null;
            userValue = null;
        }
    });
};

initialize();

module.exports = initialize;
