import express from 'express';
import { Server } from 'ws';
import mysql from 'mysql2';
import cors from 'cors';  // Import CORS

const app = express();
const port = 3001; // Port untuk backend Express

// Gunakan CORS agar frontend bisa mengakses API
app.use(cors()); // Middleware untuk mengizinkan permintaan dari frontend

// Middleware untuk parse JSON request body
app.use(express.json());

// Membuat WebSocket server
const wss = new Server({ noServer: true });

// Koneksi ke database MariaDB
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pencatatan_transaksi',
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
});

// Menambahkan transaksi dan mengirim data realtime
app.post('/api/transactions', (req, res) => {
  const { items, total, payment_method, customer_name } = req.body;

  db.query(
    'INSERT INTO transactions (items, total, payment_method, customer_name) VALUES (?, ?, ?, ?)',
    [items, total, payment_method, customer_name],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Mengirim pesan realtime ke frontend setelah transaksi ditambahkan
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(
            JSON.stringify({ message: 'New transaction added', data: req.body })
          );
        }
      });

      res.status(201).json({ message: 'Transaction added successfully' });
    }
  );
});

// Menangani upgrade server untuk WebSocket
app.server = app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
