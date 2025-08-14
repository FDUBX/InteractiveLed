/**
 * Processeur de style transfer AdaIN avec ONNX Runtime Web
 * Permet de transférer le style d'une image vers le contenu en temps réel
 */

class AdaINStyleProcessor {
    constructor() {
        this.session = null;
        this.isReady = false;
        this.processingQueue = [];
        this.isProcessing = false;
        
        // Configuration du modèle
        this.config = {
            modelPath: '/models/adain_model.onnx', // À télécharger
            inputSize: 256,
            maxBatchSize: 1,
            enableWebGPU: false // Sera activé si disponible
        };
        
        // Styles prédéfinis
        this.predefinedStyles = {
            'van_gogh': {
                name: 'Van Gogh',
                description: 'Style impressionniste avec couleurs vives',
                image: '/styles/van_gogh.jpg'
            },
            'kandinsky': {
                name: 'Kandinsky',
                description: 'Abstraction géométrique colorée',
                image: '/styles/kandinsky.jpg'
            },
            'picasso': {
                name: 'Picasso',
                description: 'Cubisme fragmenté',
                image: '/styles/picasso.jpg'
            },
            'monet': {
                name: 'Monet',
                description: 'Impressionnisme doux et lumineux',
                image: '/styles/monet.jpg'
            },
            'cyberpunk': {
                name: 'Cyberpunk',
                description: 'Néon et futurisme',
                image: '/styles/cyberpunk.jpg'
            }
        };
        
        this.currentStyle = 'van_gogh';
        this.init();
    }
    
    async init() {
        try {
            console.log('🎨 Initialisation du processeur de style AdaIN...');
            
            // Détecter WebGPU si disponible
            if (navigator.gpu) {
                this.config.enableWebGPU = true;
                console.log('🚀 WebGPU détecté - Performance maximale !');
            }
            
            // Charger le modèle ONNX
            await this.loadModel();
            
            // Charger les styles prédéfinis
            await this.preloadStyles();
            
            this.isReady = true;
            console.log('✅ Processeur de style AdaIN prêt !');
            
        } catch (error) {
            console.error('❌ Erreur d\'initialisation du processeur de style:', error);
            this.fallbackToBasicEffects();
        }
    }
    
    async loadModel() {
        try {
            console.log('📥 Chargement du modèle AdaIN ONNX...');
            
            // Charger ONNX Runtime Web
            if (typeof ort === 'undefined') {
                throw new Error('ONNX Runtime Web non disponible');
            }
            
            // Créer la session ONNX
            this.session = await ort.InferenceSession.create(this.config.modelPath, {
                executionProviders: this.config.enableWebGPU ? ['webgl', 'cpu'] : ['webgl'],
                graphOptimizationLevel: 'all',
                executionMode: 'parallel'
            });
            
            console.log('✅ Modèle AdaIN ONNX chargé avec succès !');
            console.log('🔧 Inputs:', this.session.inputNames);
            console.log('🔧 Outputs:', this.session.outputNames);
            
        } catch (error) {
            console.error('❌ Erreur de chargement du modèle ONNX:', error);
            console.log('🔄 Tentative de fallback vers modèle de base...');
            
            // Fallback : créer un modèle AdaIN basique
            await this.createBasicAdaINModel();
        }
    }
    
    async preloadStyles() {
        console.log('🖼️ Préchargement des styles...');
        
        // En production, tu préchargeras les vraies images de style
        for (const [key, style] of Object.entries(this.predefinedStyles)) {
            try {
                // Simulation du préchargement
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log(`✅ Style ${style.name} préchargé`);
            } catch (error) {
                console.warn(`⚠️ Erreur de préchargement du style ${key}:`, error);
            }
        }
    }
    
    // ===== Style Transfer Principal =====
    
    async transferStyle(contentImage, styleImage = null) {
        if (!this.isReady) {
            console.warn('⚠️ Processeur de style pas encore prêt');
            return contentImage;
        }
        
        try {
            // Si pas d'image de style spécifiée, utiliser le style courant
            if (!styleImage) {
                styleImage = await this.getCurrentStyleImage();
            }
            
            // Traitement du style transfer
            const styledResult = await this.processStyleTransfer(contentImage, styleImage);
            
            return styledResult;
            
        } catch (error) {
            console.error('❌ Erreur de style transfer:', error);
            return contentImage; // Fallback vers l'image originale
        }
    }
    
    async processStyleTransfer(contentImage, styleImage) {
        console.log('🎨 Application du style transfer AdaIN ONNX...');
        
        try {
            if (this.session) {
                // Utiliser le vrai modèle ONNX
                return await this.runAdaINONNX(contentImage, styleImage);
            } else {
                // Fallback vers AdaIN basique
                return await this.runBasicAdaIN(contentImage, styleImage);
            }
        } catch (error) {
            console.error('❌ Erreur de style transfer:', error);
            return contentImage;
        }
    }
    
    // ===== VRAI AdaIN ONNX =====
    
    async runAdaINONNX(contentImage, styleImage) {
        console.log('🚀 Exécution AdaIN avec ONNX Runtime...');
        
        try {
            // Préparer les tensors d'entrée
            const contentTensor = await this.imageToTensor(contentImage);
            const styleTensor = await this.imageToTensor(styleImage);
            
            // Exécuter l'inférence
            const feeds = {
                [this.session.inputNames[0]]: contentTensor,  // content
                [this.session.inputNames[1]]: styleTensor     // style
            };
            
            const results = await this.session.run(feeds);
            const outputTensor = results[this.session.outputNames[0]];
            
            // Convertir le résultat en image
            const resultCanvas = await this.tensorToImage(outputTensor);
            
            console.log('✅ Style transfer AdaIN ONNX réussi !');
            return resultCanvas;
            
        } catch (error) {
            console.error('❌ Erreur AdaIN ONNX:', error);
            throw error;
        }
    }
    
    async runBasicAdaIN(contentImage, styleImage) {
        console.log('🔄 Exécution AdaIN basique (fallback)...');
        
        // Implémentation AdaIN basique sans ONNX
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = contentImage.width;
        canvas.height = contentImage.height;
        
        // Dessiner l'image de contenu
        ctx.drawImage(contentImage, 0, 0);
        
        // Appliquer AdaIN basique
        await this.applyBasicAdaIN(ctx, canvas.width, canvas.height, styleImage);
        
        return canvas;
    }
    
    async applyBasicAdaIN(ctx, width, height, styleImage) {
        // Implémentation AdaIN basique : Adaptive Instance Normalization
        const contentData = ctx.getImageData(0, 0, width, height);
        const styleData = await this.getImageData(styleImage, width, height);
        
        // Calculer les statistiques de style (moyenne et variance)
        const styleStats = this.computeStyleStatistics(styleData, width, height);
        
        // Appliquer AdaIN : normaliser le contenu avec les statistiques de style
        this.applyAdaINNormalization(contentData, styleStats, width, height);
        
        ctx.putImageData(contentData, 0, 0);
    }
    
    computeStyleStatistics(imageData, width, height) {
        const data = imageData.data;
        const channels = 3; // RGB
        
        const means = [0, 0, 0];
        const variances = [0, 0, 0];
        
        // Calculer les moyennes
        for (let i = 0; i < data.length; i += 4) {
            means[0] += data[i];     // Rouge
            means[1] += data[i + 1]; // Vert
            means[2] += data[i + 2]; // Bleu
        }
        
        const pixelCount = width * height;
        means[0] /= pixelCount;
        means[1] /= pixelCount;
        means[2] /= pixelCount;
        
        // Calculer les variances
        for (let i = 0; i < data.length; i += 4) {
            const diffR = data[i] - means[0];
            const diffG = data[i + 1] - means[1];
            const diffB = data[i + 2] - means[2];
            
            variances[0] += diffR * diffR;
            variances[1] += diffG * diffG;
            variances[2] += diffB * diffB;
        }
        
        variances[0] = Math.sqrt(variances[0] / pixelCount);
        variances[1] = Math.sqrt(variances[1] / pixelCount);
        variances[2] = Math.sqrt(variances[2] / pixelCount);
        
        return { means, variances };
    }
    
    applyAdaINNormalization(contentData, styleStats, width, height) {
        const data = contentData.data;
        const { means: styleMeans, variances: styleVars } = styleStats;
        
        // Calculer les statistiques du contenu
        const contentMeans = [0, 0, 0];
        const contentVars = [0, 0, 0];
        
        // Moyennes du contenu
        for (let i = 0; i < data.length; i += 4) {
            contentMeans[0] += data[i];
            contentMeans[1] += data[i + 1];
            contentMeans[2] += data[i + 2];
        }
        
        const pixelCount = width * height;
        contentMeans[0] /= pixelCount;
        contentMeans[1] /= pixelCount;
        contentMeans[2] /= pixelCount;
        
        // Variances du contenu
        for (let i = 0; i < data.length; i += 4) {
            const diffR = data[i] - contentMeans[0];
            const diffG = data[i + 1] - contentMeans[1];
            const diffB = data[i + 2] - contentMeans[2];
            
            contentVars[0] += diffR * diffR;
            contentVars[1] += diffG * diffG;
            contentVars[2] += diffB * diffB;
        }
        
        contentVars[0] = Math.sqrt(contentVars[0] / pixelCount);
        contentVars[1] = Math.sqrt(contentVars[1] / pixelCount);
        contentVars[2] = Math.sqrt(contentVars[2] / pixelCount);
        
        // Appliquer AdaIN : (x - μ_c) * (σ_s / σ_c) + μ_s
        for (let i = 0; i < data.length; i += 4) {
            // Rouge
            if (contentVars[0] > 0) {
                data[i] = (data[i] - contentMeans[0]) * (styleVars[0] / contentVars[0]) + styleMeans[0];
            }
            
            // Vert
            if (contentVars[1] > 0) {
                data[i + 1] = (data[i + 1] - contentMeans[1]) * (styleVars[1] / contentVars[1]) + styleMeans[1];
            }
            
            // Bleu
            if (contentVars[2] > 0) {
                data[i + 2] = (data[i + 2] - contentMeans[2]) * (styleVars[2] / contentVars[2]) + styleMeans[2];
            }
            
            // Clamper les valeurs
            data[i] = Math.max(0, Math.min(255, data[i]));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
        }
    }
    
    // ===== Utilitaires Tensor/Image =====
    
    async imageToTensor(image) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionner à la taille d'entrée du modèle
        canvas.width = this.config.inputSize;
        canvas.height = this.config.inputSize;
        
        ctx.drawImage(image, 0, 0, this.config.inputSize, this.config.inputSize);
        
        const imageData = ctx.getImageData(0, 0, this.config.inputSize, this.config.inputSize);
        const data = imageData.data;
        
        // Convertir en tensor Float32Array [1, 3, H, W]
        const tensor = new Float32Array(this.config.inputSize * this.config.inputSize * 3);
        
        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = Math.floor(i / 4);
            const x = pixelIndex % this.config.inputSize;
            const y = Math.floor(pixelIndex / this.config.inputSize);
            
            // Format NCHW : [batch, channel, height, width]
            const rIndex = 0 * this.config.inputSize * this.config.inputSize + y * this.config.inputSize + x;
            const gIndex = 1 * this.config.inputSize * this.config.inputSize + y * this.config.inputSize + x;
            const bIndex = 2 * this.config.inputSize * this.config.inputSize + y * this.config.inputSize + x;
            
            // Normaliser [0, 255] → [0, 1]
            tensor[rIndex] = data[i] / 255.0;
            tensor[gIndex] = data[i + 1] / 255.0;
            tensor[bIndex] = data[i + 2] / 255.0;
        }
        
        return new ort.Tensor('float32', tensor, [1, 3, this.config.inputSize, this.config.inputSize]);
    }
    
    async tensorToImage(tensor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.config.inputSize;
        canvas.height = this.config.inputSize;
        
        const imageData = ctx.createImageData(this.config.inputSize, this.config.inputSize);
        const data = imageData.data;
        const tensorData = tensor.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = Math.floor(i / 4);
            const x = pixelIndex % this.config.inputSize;
            const y = Math.floor(pixelIndex / this.config.inputSize);
            
            // Format NCHW → RGB
            const rIndex = 0 * this.config.inputSize * this.config.inputSize + y * this.config.inputSize + x;
            const gIndex = 1 * this.config.inputSize * this.config.inputSize + y * this.config.inputSize + x;
            const bIndex = 2 * this.config.inputSize * this.config.inputSize + y * this.config.inputSize + x;
            
            // Dénormaliser [0, 1] → [0, 255] et clamper
            data[i] = Math.max(0, Math.min(255, Math.floor(tensorData[rIndex] * 255)));
            data[i + 1] = Math.max(0, Math.min(255, Math.floor(tensorData[gIndex] * 255)));
            data[i + 2] = Math.max(0, Math.min(255, Math.floor(tensorData[bIndex] * 255)));
            data[i + 3] = 255; // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
    
    async getImageData(image, width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
        
        return ctx.getImageData(0, 0, width, height);
    }
    
    async createBasicAdaINModel() {
        console.log('🔧 Création du modèle AdaIN basique...');
        // Modèle basique créé, pas besoin de session ONNX
    }
    
    async applySimulatedStyle(ctx, width, height) {
        // Simulation d'effets de style
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Effet de style basé sur le style courant
        switch (this.currentStyle) {
            case 'van_gogh':
                this.applyVanGoghStyle(data, width, height);
                break;
            case 'kandinsky':
                this.applyKandinskyStyle(data, width, height);
                break;
            case 'cyberpunk':
                this.applyCyberpunkStyle(data, width, height);
                break;
            default:
                this.applyImpressionistStyle(data, width, height);
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // ===== Effets de Style Simulés =====
    
    applyVanGoghStyle(data, width, height) {
        // Simulation du style Van Gogh : couleurs vives, contrastes
        for (let i = 0; i < data.length; i += 4) {
            // Augmenter la saturation
            data[i] = Math.min(255, data[i] * 1.3);     // Rouge
            data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Vert
            data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Bleu
            
            // Ajouter du contraste
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 128) {
                data[i] = Math.min(255, data[i] * 1.1);
                data[i + 1] = Math.min(255, data[i + 1] * 1.1);
                data[i + 2] = Math.min(255, data[i + 2] * 1.1);
            }
        }
    }
    
    applyKandinskyStyle(data, width, height) {
        // Simulation du style Kandinsky : abstraction géométrique
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            
            // Créer des zones géométriques
            if ((x % 50 < 25) !== (y % 50 < 25)) {
                data[i] = Math.min(255, data[i] * 1.5);     // Rouge
                data[i + 1] = Math.max(0, data[i + 1] * 0.8); // Vert
                data[i + 2] = Math.min(255, data[i + 2] * 1.3); // Bleu
            }
        }
    }
    
    applyCyberpunkStyle(data, width, height) {
        // Simulation du style Cyberpunk : néon et futurisme
        for (let i = 0; i < data.length; i += 4) {
            // Augmenter les couleurs néon
            data[i] = Math.min(255, data[i] * 1.4);     // Rouge néon
            data[i + 1] = Math.min(255, data[i + 1] * 1.6); // Vert néon
            data[i + 2] = Math.min(255, data[i + 2] * 1.8); // Bleu néon
            
            // Ajouter un effet de lueur
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 100) {
                data[i + 3] = Math.min(255, data[i + 3] + 20); // Alpha pour la lueur
            }
        }
    }
    
    applyImpressionistStyle(data, width, height) {
        // Style impressionniste général
        for (let i = 0; i < data.length; i += 4) {
            // Adoucir les couleurs
            data[i] = Math.min(255, data[i] * 1.1);
            data[i + 1] = Math.min(255, data[i + 1] * 1.15);
            data[i + 2] = Math.min(255, data[i + 2] * 1.05);
        }
    }
    
    // ===== Gestion des Styles =====
    
    async getCurrentStyleImage() {
        const style = this.predefinedStyles[this.currentStyle];
        if (!style) return null;
        
        try {
            // En production, tu chargeras la vraie image
            // Pour l'instant, on simule
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = this.getStyleColor(this.currentStyle);
            ctx.fillRect(0, 0, 256, 256);
            
            return canvas;
            
        } catch (error) {
            console.error('❌ Erreur de chargement du style:', error);
            return null;
        }
    }
    
    getStyleColor(styleKey) {
        const colors = {
            'van_gogh': '#FFD700',
            'kandinsky': '#FF6B6B',
            'picasso': '#4ECDC4',
            'monet': '#45B7D1',
            'cyberpunk': '#FF00FF'
        };
        return colors[styleKey] || '#FFD700';
    }
    
    setStyle(styleKey) {
        if (this.predefinedStyles[styleKey]) {
            this.currentStyle = styleKey;
            console.log(`🎭 Style changé vers: ${this.predefinedStyles[styleKey].name}`);
            return true;
        }
        return false;
    }
    
    getAvailableStyles() {
        return Object.keys(this.predefinedStyles);
    }
    
    getStyleInfo(styleKey) {
        return this.predefinedStyles[styleKey] || null;
    }
    
    getCurrentStyle() {
        return this.currentStyle;
    }
    
    // ===== Fallback =====
    
    fallbackToBasicEffects() {
        console.log('🔄 Fallback vers les effets de base...');
        this.isReady = false;
        // Ici tu pourrais activer des effets de base sans ML
    }
    
    // ===== Utilitaires =====
    
    isWebGPUAvailable() {
        return this.config.enableWebGPU;
    }
    
    getStatus() {
        return {
            isReady: this.isReady,
            currentStyle: this.currentStyle,
            webGPU: this.config.enableWebGPU,
            modelLoaded: this.session !== null
        };
    }
    
    // ===== Nettoyage =====
    
    destroy() {
        if (this.session) {
            this.session.release();
        }
        console.log('🗑️ Processeur de style AdaIN détruit');
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaINStyleProcessor;
}
