require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const initialize = require('./bot');

const app = express();
app.use(express.json());
app.use(cors());

const client = new MercadoPagoConfig({
    accessToken: process.env.ACCESS_TOKEN,
    options: {
        timeout: 30000,
    },
});

const payment = new Payment(client);

app.post('/donate', async (req, res) => {
    const { email, valor } = req.body;
    const transaction_amount = parseFloat(valor);
    
    try {
        const body = {
            transaction_amount: transaction_amount,
            description: 'Teste api pix V2',
            payment_method_id: 'pix',
            payer: {
                email: email,
            },
        };

        const paymentResponse = await payment.create({ body });
        const qrCodeData = paymentResponse.point_of_interaction.transaction_data.qr_code;

        if (!qrCodeData) {

            return res.status(400).json({ error: 'QR Code não encontrado na resposta do pagamento.' });

        }

        return res.json({ qrCodeData }); 
        
    } catch (error) {

        console.error('Ocorreu um erro', error);
        return res.status(500).json({ error: 'Erro ao processar o pagamento.' });

    }
});

app.listen(PORT, () => {

    console.log(`Servidor rodando na porta ${PORT}`);
    initialize();
    
});
