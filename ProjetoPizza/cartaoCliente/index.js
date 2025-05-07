
const axios = require('axios');
const cartaoService = axios.create({
  baseURL: 'http://localhost:8080/cartao',
});

async function realizarCompra(numeroCartao, valor) {
  try {
    const response = await cartaoService.post('/compras', {
      numeroCartao,
      valor,
    });

    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error('Erro ao realizar compra:', error.message);
    }
  }
}

async function consultarSaldo(numeroCartao) {
  try {
    const response = await cartaoService.get(`/saldo/${numeroCartao}`);

    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error('Erro ao consultar saldo:', error.message);
    }
  }
}

// Exemplo de uso
realizarCompra('1234-5678-9012-3456', 100);
consultarSaldo('1234-5678-9012-3456');
