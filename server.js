// server.js (patch)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } }); // restreins en prod

app.use(express.static('public')); // garde tes fichiers dans /public

let displaySocketId = null;

// Occupation stricte des côtés
const sides = { left: null, right: null }; // socketId ou null
const controllers = new Map(); // socketId -> { side }

function broadcastStatus() {
  io.emit('room:status', {
    hasDisplay: !!displaySocketId,
    sides: { left: !!sides.left, right: !!sides.right },
    count: controllers.size,
  });
}

io.on('connection', (socket) => {
  let role = null;

  socket.on('display:join', () => {
    if (displaySocketId) {
      socket.emit('error', { msg: 'Un autre display est déjà connecté' });
      return;
    }
    displaySocketId = socket.id;
    role = 'display';
    socket.emit('display:joined');
    broadcastStatus();
  });

  socket.on('controller:join', ({ side }) => {
    if (!displaySocketId) {
      socket.emit('error', { msg: 'Aucun display connecté' });
      return;
    }
    role = 'controller';

    // Choix du côté demandé si libre, sinon l’autre, sinon refus
    const want = side === 'right' ? 'right' : 'left';
    const other = want === 'left' ? 'right' : 'left';
    let chosen = null;

    if (!sides[want]) chosen = want;
    else if (!sides[other]) chosen = other;

    if (!chosen) {
      socket.emit('error', { msg: 'Les deux côtés sont déjà pris' });
      return;
    }

    sides[chosen] = socket.id;
    controllers.set(socket.id, { side: chosen });

    socket.data.side = chosen;
    socket.emit('controller:joined', { side: chosen });
    broadcastStatus();
  });

  socket.on('control', (payload) => {
    if (role !== 'controller' || !displaySocketId) return;

    // Clamp + timestamp
    const nx = Math.max(0, Math.min(1, Number(payload?.nx ?? 0.5)));
    const ny = Math.max(0, Math.min(1, Number(payload?.ny ?? 0.5)));
    const ts = typeof payload?.ts === 'number' ? payload.ts : Date.now();

    io.to(displaySocketId).emit('control', {
      side: socket.data.side || 'left',
      nx, ny, ts
    });
  });

  socket.on('display:broadcast', (msg) => {
    if (role === 'display') io.emit('display:broadcast', msg);
  });

  socket.on('disconnect', () => {
    if (role === 'display' && displaySocketId === socket.id) {
      displaySocketId = null;
      // Libère tout
      for (const k of ['left', 'right']) sides[k] = null;
      controllers.clear();
      broadcastStatus();
    } else if (role === 'controller') {
      const side = socket.data.side;
      if (side && sides[side] === socket.id) sides[side] = null;
      controllers.delete(socket.id);
      broadcastStatus();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('server on http://localhost:' + PORT));
