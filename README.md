# 🎨 InteractiveLED - Écran LED Interactif avec Style Transfer AI

## 🚀 **Description**

Application web interactive permettant de dessiner sur un écran LED piloté par un Media Server Modulo Pi. L'interface utilise le tracé du doigt enrichi graphiquement avec de l'IA pour créer des effets visuels uniques en temps réel.

## ✨ **Fonctionnalités**

### **🎯 Interface Interactive**
- **Page de Contrôle** : Dessin tactile sur mobile/tablette
- **Page d'Affichage** : Rendu en temps réel sur l'écran LED
- **Communication WebSocket** : Synchronisation instantanée

### **🎨 Style Transfer AI**
- **AdaIN (Adaptive Instance Normalization)** : Transfert de style en temps réel
- **Styles Prédéfinis** : Van Gogh, Picasso, Monet, Kandinsky, Cyberpunk
- **Fallback Mathématique** : Algorithme AdaIN basique si le modèle ONNX n'est pas disponible

### **⚡ Rendu Haute Performance**
- **PixiJS (WebGL)** : Accélération matérielle pour les effets visuels
- **Particules Dynamiques** : Effets adaptés à chaque style
- **Trails et Effets** : Traînées lumineuses et transformations visuelles

### **⏰ Effets Temporels**
- **FIFO Timeout** : Les traits "fondent" progressivement
- **Timeout Configurable** : De 1 seconde à plusieurs minutes
- **Effets en Temps Réel** : Même pendant le dessin continu

## 🏗️ **Architecture**

```
InteractiveLED/
├── server.js                 # Serveur Node.js + WebSocket
├── package.json             # Dépendances
├── public/
│   ├── control.html         # Interface de contrôle mobile
│   ├── display-pixi.html    # Page d'affichage LED
│   ├── display-pixi.js      # Rendu PixiJS + effets
│   ├── style-processor.js   # Processeur AdaIN + ONNX
│   ├── models/              # Modèles ONNX
│   └── styles/              # Images de référence de style
```

## 🚀 **Installation et Démarrage**

### **1. Prérequis**
- Node.js 18+ 
- Navigateur moderne avec support WebGL

### **2. Installation**
```bash
npm install
```

### **3. Démarrage**
```bash
npm start
```

### **4. Accès**
- **Contrôle** : http://localhost:3000/control.html
- **Affichage LED** : http://localhost:3000/display

## 🎯 **Utilisation**

### **Interface de Contrôle**
1. Ouvre `control.html` sur ton mobile/tablette
2. Dessine avec ton doigt sur la zone tactile
3. Change de style avec le bouton "Style"
4. Ajuste la taille du pinceau et la couleur
5. Configure le timeout des effets

### **Écran d'Affichage**
1. Ouvre `display.html` sur l'écran LED
2. Observe tes dessins en temps réel
3. Vois les effets de particules et trails
4. Les traits disparaissent selon le timeout configuré

## 🔧 **Configuration**

### **Styles Disponibles**
- **Van Gogh** : Couleurs vives, impressionnisme
- **Picasso** : Contrastes marqués, cubisme
- **Monet** : Couleurs douces, luminosité
- **Kandinsky** : Abstraction géométrique
- **Cyberpunk** : Effets néon, futuriste

### **Paramètres**
- **Brush Size** : Taille du pinceau (1-20)
- **Timeout** : Durée d'affichage des traits (1s-5min)
- **Effects** : Intensité des effets visuels

## 🎨 **Technologies Utilisées**

### **Frontend**
- **HTML5 Canvas** : Capture tactile
- **PixiJS** : Rendu WebGL accéléré
- **WebSocket** : Communication temps réel

### **Backend**
- **Node.js** : Serveur HTTP + WebSocket
- **Express** : Framework web
- **Socket.io** : Communication bidirectionnelle

### **AI/ML**
- **ONNX Runtime Web** : Exécution de modèles ML
- **AdaIN** : Transfert de style neural
- **Fallback Mathématique** : Algorithme AdaIN basique

## 🔮 **Roadmap**

### **Phase 1** ✅
- [x] Interface de dessin tactile
- [x] Communication WebSocket
- [x] Rendu PixiJS basique
- [x] Effets de particules

### **Phase 2** ✅
- [x] Intégration ONNX Runtime Web
- [x] Processeur AdaIN
- [x] Styles prédéfinis
- [x] Fallback mathématique

### **Phase 3** 🚧
- [ ] Modèles ONNX pré-entraînés
- [ ] WebGPU pour performance maximale
- [ ] Styles personnalisés
- [ ] Export des créations

## 🐛 **Dépannage**

### **Problèmes Courants**
- **Dessin ne s'affiche pas** : Vérifie la connexion WebSocket
- **Styles ne changent pas** : Vérifie la console pour les erreurs
- **Performance lente** : Active WebGPU si disponible

### **Logs Utiles**
- Console du navigateur (F12)
- Logs du serveur dans le terminal
- Statut WebSocket dans l'interface

## 📝 **Licence**

MIT License - François Dubeaux

## 🤝 **Contribution**

Les contributions sont les bienvenues ! N'hésite pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouveaux styles
- Optimiser les performances

---

**🎨 Créez de l'art interactif sur votre écran LED !** ✨
