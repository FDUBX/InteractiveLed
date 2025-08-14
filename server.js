
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes principales
app.get('/', (req, res) => {
    res.redirect('/display');
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'display-pixi.html'));
});

app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

// API pour générer un QR code
app.get('/api/qrcode', async (req, res) => {
  try {
    const host = req.get('host');
    const controlUrl = `http://${host}/control`;
    const qrCodeDataURL = await QRCode.toDataURL(controlUrl);
    res.json({ qrCode: qrCodeDataURL, url: controlUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erreur génération QR code' });
  }
});

// Gestion des connexions WebSocket
const displayClients = new Set();
const controlClients = new Set();

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  // Identification du type de client
  socket.on('register', (data) => {
    const { type } = data;
    
    if (type === 'display') {
      displayClients.add(socket);
      console.log('🖥️ Client display connecté:', socket.id);
      console.log('📊 Total écrans d\'affichage:', displayClients.size);
      
      // Envoyer les informations de connexion
      socket.emit('status', { 
        type: 'info', 
        message: 'Écran d\'affichage connecté',
        controlClients: controlClients.size 
      });
    } 
    else if (type === 'control') {
      controlClients.add(socket);
      console.log('Client control connecté:', socket.id);
      
      // Notifier les écrans d'affichage
      displayClients.forEach(displaySocket => {
        displaySocket.emit('status', { 
          type: 'info', 
          message: 'Nouveau contrôleur connecté',
          controlClients: controlClients.size 
        });
      });
      
      socket.emit('status', { 
        type: 'success', 
        message: 'Connecté à l\'écran LED' 
      });
    }
  });

  // Transmission des données de dessin
  socket.on('drawing-data', (data) => {
    console.log('📥 Données de dessin reçues du contrôle:', data);
    console.log('🎯 Nombre d\'écrans d\'affichage connectés:', displayClients.size);
    
    // Enrichissement des données avec l'ID du client
    const enrichedData = {
      ...data,
      clientId: socket.id,
      timestamp: Date.now()
    };

    // Diffuser vers tous les écrans d'affichage
    displayClients.forEach(displaySocket => {
      console.log('📤 Envoi des données vers l\'écran:', displaySocket.id);
      displaySocket.emit('drawing-data', enrichedData);
    });
    
    console.log('✅ Données diffusées vers', displayClients.size, 'écran(s)');
  });

  // Commandes de contrôle
  socket.on('clear-canvas', () => {
    displayClients.forEach(displaySocket => {
      displaySocket.emit('clear-canvas');
    });
  });

  socket.on('change-effect', (effectData) => {
    displayClients.forEach(displaySocket => {
      displaySocket.emit('change-effect', effectData);
    });
  });

  socket.on('change-timeout', (timeoutData) => {
    displayClients.forEach(displaySocket => {
      displaySocket.emit('change-timeout', timeoutData);
    });
  });
  
  socket.on('change-style', (styleData) => {
    console.log('🎨 Changement de style reçu:', styleData);
    displayClients.forEach(displaySocket => {
      displaySocket.emit('change-style', styleData);
    });
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
    
    displayClients.delete(socket);
    controlClients.delete(socket);
    
    // Notifier les écrans d'affichage du changement
    displayClients.forEach(displaySocket => {
      displaySocket.emit('status', { 
        type: 'info', 
        message: 'Contrôleur déconnecté',
        controlClients: controlClients.size 
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📱 Page de contrôle: http://localhost:${PORT}/control`);
  console.log(`🖥️  Page d'affichage: http://localhost:${PORT}/display`);
});
