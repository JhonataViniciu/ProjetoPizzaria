const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express(); //  - ESSA LINHA CRIA O APP
const port = 3000;

app.use(cors({
    origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json());

// Configuração do banco de dados MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'root',
    port: 3000,
    database: 'pizzaria',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Função para lidar com erros de consulta
function handleDatabaseError(err, res, message) {
    console.error(err);
    return res.status(500).json({ erro: message });
}

app.get('/catalogo', (req, res) => {
    const query = 'SELECT id, nome, ingredientes, preco FROM pizzas';
    pool.query(query, (err, results) => {
        if (err) {
            return handleDatabaseError(err, res, 'Erro ao buscar pizzas');
        }
        res.json(results);
    });
});

// ===== Clientes =====
app.get('/clientes', (req, res) => {
    const query = 'SELECT codigo, nome, telefone, endereco, status FROM clientes';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            return handleDatabaseError(err, res, 'Erro ao listar clientes');
        }
        console.log('Resultados da consulta:', results);
        res.json(results);
    });
});

app.put('/clientes/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const { nome, telefone, endereco, status } = req.body;

    if (!nome || !telefone || !endereco || !status) {
        return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const query = `
        INSERT INTO clientes (codigo, nome, telefone, endereco, status)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        nome = ?, telefone = ?, endereco = ?, status = ?
    `;
    pool.query(query, [codigo, nome, telefone, endereco, status, nome, telefone, endereco, status], (err, results) => {
        if (err) {
            return handleDatabaseError(err, res, 'Erro ao salvar cliente');
        }
        res.json({ mensagem: 'Cliente salvo com sucesso' });
    });
});

app.patch('/clientes/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ erro: 'Status é obrigatório' });
    }

    const query = 'UPDATE clientes SET status = ? WHERE codigo = ?';
    pool.query(query, [status, codigo], (err, results) => {
        if (err) {
            return handleDatabaseError(err, res, 'Erro ao atualizar status');
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado' });
        }
        res.json({ mensagem: 'Status atualizado com sucesso' });
    });
});

// ===== Pedidos =====
app.get('/pedidos', (req, res) => {
    const query = 'SELECT codigoPedido, codigoCliente, descricao, valor, status FROM pedidos';
    pool.query(query, (err, results) => {
        if (err) {
            return handleDatabaseError(err, res, 'Erro ao listar pedidos');
        }
        res.json(results);
    });
});

app.put('/pedidos/:codigoPedido', (req, res) => {
    const codigoPedido = req.params.codigoPedido;
    const { codigoCliente, descricao, valor, status } = req.body;

    if (!codigoCliente || !descricao || !valor || !status) {
        return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const query = `
        INSERT INTO pedidos (codigoPedido, codigoCliente, descricao, valor, status)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        codigoCliente = ?, descricao = ?, valor = ?, status = ?
    `;
    pool.query(query, [codigoPedido, codigoCliente, descricao, valor, status, codigoCliente, descricao, valor, status], (err, results) => {
        if (err) {
            return handleDatabaseError(err, res, 'Erro ao salvar pedido');
        }
        res.json({ mensagem: 'Pedido salvo com sucesso' });
    });
});

//ROTAS JSON
// // Rota para obter o catálogo de pizzas do banco de dados
// app.get('/catalogo', (req, res) => {
//     const query = 'SELECT id, nome, ingredientes, preco FROM pizzas'; // Adicionei o preço
//     pool.query(query, (err, results) => {
//         if (err) {
//             return handleDatabaseError(err, res, 'Erro ao buscar pizzas do banco de dados');
//         }
//         res.json(results);
//     });
// });

// // CLIENTES
// const clientePath = 'clientes.json';

// // Funções utilitárias
// function lerClientes() {
//     try {
//         const data = fs.readFileSync(clientePath, 'utf8');
//         return JSON.parse(data);
//     } catch (err) {
//         return [];
//     }
// }

// function escreverClientes(clientes) {
//     fs.writeFileSync(clientePath, JSON.stringify(clientes, null, 2));
// }

// // Rota GET para listar todos os clientes
// app.get('/clientes', function (req, res) {
//     const clientes = lerClientes();
//     res.json(clientes);
// });

// // Rota PUT para criar ou atualizar cliente
// app.put('/clientes/:codigo', function (req, res) {
//     const codigo = req.params.codigo;
//     const { nome, telefone, endereco, status } = req.body;

//     if (!nome || !telefone || !endereco || !status) {
//         return res.status(400).json({ erro: 'Dados incompletos' });
//     }

//     const clientes = lerClientes();
//     const index = clientes.findIndex(c => String(c.codigo) === codigo);

//     const novoCliente = { codigo, nome, telefone, endereco, status };

//     if (index !== -1) {
//         clientes[index] = novoCliente;
//     } else {
//         clientes.push(novoCliente);
//     }

//     escreverClientes(clientes);
//     res.json({ mensagem: 'Cliente salvo com sucesso' });
// });

// // Rota PATCH para desativar cliente
// app.patch('/clientes/:codigo', function (req, res) {
//     const codigo = String(req.params.codigo);
//     const { status } = req.body;

//     const clientes = lerClientes();
//     const index = clientes.findIndex(c => c.codigo === codigo);

//     if (index === -1) {
//         return res.status(404).json({ erro: 'Cliente não encontrado' });
//     }

//     clientes[index].status = status;
//     escreverClientes(clientes);
//     res.json({ mensagem: 'Status atualizado com sucesso' });
// });



// // ===== Pedidos =====
// const pedidoPath = 'pedidos.json';

// // Funções utilitárias
// function lerPedidos() {
//     try {
//         const data = fs.readFileSync(pedidoPath, 'utf8');
//         return JSON.parse(data);
//     } catch (err) {
//         return [];
//     }
// }

// function escreverPedidos(pedidos) {
//     fs.writeFileSync(pedidoPath, JSON.stringify(pedidos, null, 2));
// }

// // Rota GET para listar pedidos
// app.get('/pedidos', function (req, res) {
//     const pedidos = lerPedidos();
//     res.json(pedidos);
// });

// // Rota PUT para criar ou atualizar um pedido
// app.put('/pedidos/:codigoPedido', function (req, res) {
//     const codigoPedido = req.params.codigoPedido;
//     const { codigoCliente, descricao, valor, status } = req.body;

//     if (!codigoCliente || !descricao || !valor || !status) {
//         return res.status(400).json({ erro: 'Dados incompletos' });
//     }

//     const pedidos = lerPedidos();
//     const index = pedidos.findIndex(p => String(p.codigoPedido) === codigoPedido);

//     const novoPedido = { codigoPedido, codigoCliente, descricao, valor, status };

//     if (index !== -1) {
//         pedidos[index] = novoPedido;
//     } else {
//         pedidos.push(novoPedido);
//     }

//     escreverPedidos(pedidos);
//     res.json({ mensagem: 'Pedido salvo com sucesso' });
// });

// Teste de conexão com o MySQL
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conexão com MySQL estabelecida com sucesso!');
        connection.release();
    }
});


// Inicia o servidor
app.listen(port, function () {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


