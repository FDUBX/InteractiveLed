/**
 * Moteur de rendu PixiJS pour Interactive LED Display
 * Remplace le Canvas HTML5 par un rendu WebGL accéléré
 */

class PixiLEDRenderer {
    constructor(containerId = 'pixiContainer') {
        this.container = document.getElementById(containerId);
        this.app = null;
        this.particles = [];
        this.trails = [];
        this.strokes = [];
        
        // Configuration PixiJS
        this.config = {
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            powerPreference: 'high-performance'
        };
        
        // Paramètres des effets
        this.effects = {
            particles: {
                maxCount: 10000,
                defaultSize: 3,
                defaultLife: 60
            },
            trails: {
                maxCount: 5000,
                defaultSize: 8,
                fadeRate: 0.02
            }
        };
        
        this.init();
    }
    
    init() {
        // Créer l'application PixiJS
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: this.config.backgroundColor,
            antialias: this.config.antialias,
            resolution: this.config.resolution,
            autoDensity: this.config.autoDensity,
            powerPreference: this.config.powerPreference
        });
        
        // Ajouter le canvas PixiJS au DOM
        this.container.appendChild(this.app.view);
        
        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.resize());
        
        // Démarrer la boucle de rendu
        this.app.ticker.add(() => this.update());
        
        console.log('🎨 PixiJS LED Renderer initialisé');
    }
    
    resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        console.log('📐 PixiJS redimensionné:', window.innerWidth, 'x', window.innerHeight);
    }
    
    // ===== Gestion des particules =====
    
    addParticles(x, y, color, pressure, count = null, style = 'van_gogh') {
        const particleCount = count || Math.floor((pressure || 0.5) * 25) + 10;
        
        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.effects.particles.maxCount) break;
            
            const particle = new PIXI.Graphics();
            
            // Appliquer le style aux particules
            const styledColor = this.applyStyleToColor(color, style);
            particle.beginFill(styledColor);
            
            // Forme selon le style
            const size = this.getStyleParticleSize(style, pressure);
            this.drawStyleParticle(particle, style, size);
            particle.endFill();
            
            // Position et mouvement selon le style
            const { posX, posY, velX, velY } = this.getStyleParticleMovement(style, x, y);
            particle.x = posX;
            particle.y = posY;
            particle.vx = velX;
            particle.vy = velY;
            
            // Propriétés de vie selon le style
            particle.life = 1.0;
            particle.maxLife = this.getStyleParticleLife(style);
            particle.alpha = 1.0;
            
            // Ajouter au stage
            this.app.stage.addChild(particle);
            this.particles.push(particle);
        }
    }
    
    // ===== Méthodes de Style pour Particules =====
    
    applyStyleToColor(baseColor, style) {
        const color = this.hexColor(baseColor);
        
        switch (style) {
            case 'van_gogh':
                // Palette Van Gogh : jaunes dorés, bleus profonds, verts émeraude
                return this.createVanGoghPalette(color);
            case 'kandinsky':
                // Palette Kandinsky : couleurs primaires vives, contrastes forts
                return this.createKandinskyPalette(color);
            case 'picasso':
                // Palette Picasso : tons terre, ocres, contrastes dramatiques
                return this.createPicassoPalette(color);
            case 'monet':
                // Palette Monet : pastels doux, tons impressionnistes
                return this.createMonetPalette(color);
            case 'cyberpunk':
                // Palette Cyberpunk : néons vifs, violets, cyans électriques
                return this.createCyberpunkPalette(color);
            default:
                return color;
        }
    }
    
    adjustColor(color, rMult, gMult, bMult) {
        // Extraire les composants RGB
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Appliquer les multiplicateurs
        const newR = Math.min(255, Math.floor(r * rMult));
        const newG = Math.min(255, Math.floor(g * gMult));
        const newB = Math.min(255, Math.floor(b * bMult));
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    // ===== Nouvelles Palettes de Couleurs Distinctives =====
    
    createVanGoghPalette(color) {
        // Palette Van Gogh : jaunes dorés, bleus profonds, verts émeraude
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Transformation vers la palette Van Gogh
        let newR = r, newG = g, newB = b;
        
        if (r > g && r > b) {
            // Rouge dominant → Jaune doré
            newR = Math.min(255, r + 30);
            newG = Math.min(255, g + 40);
            newB = Math.max(0, b - 20);
        } else if (b > r && b > g) {
            // Bleu dominant → Bleu profond
            newR = Math.max(0, r - 30);
            newG = Math.max(0, g - 20);
            newB = Math.min(255, b + 20);
        } else if (g > r && g > b) {
            // Vert dominant → Vert émeraude
            newR = Math.max(0, r - 15);
            newG = Math.min(255, g + 25);
            newB = Math.max(0, b - 10);
        }
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    createKandinskyPalette(color) {
        // Palette Kandinsky : couleurs primaires vives, contrastes forts
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Transformation vers la palette Kandinsky
        let newR = r, newG = g, newB = b;
        
        // Augmenter la saturation et le contraste
        const avg = (r + g + b) / 3;
        if (avg > 128) {
            // Couleurs claires → plus vives
            newR = Math.min(255, r + 40);
            newG = Math.min(255, g + 40);
            newB = Math.min(255, b + 40);
        } else {
            // Couleurs sombres → plus profondes
            newR = Math.max(0, r - 30);
            newG = Math.max(0, g - 30);
            newB = Math.max(0, b - 30);
        }
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    createPicassoPalette(color) {
        // Palette Picasso : tons terre, ocres, contrastes dramatiques
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Transformation vers la palette Picasso
        let newR = r, newG = g, newB = b;
        
        // Ajouter des tons terre et ocre
        newR = Math.min(255, r + 20);
        newG = Math.min(255, g + 15);
        newB = Math.max(0, b - 25);
        
        // Augmenter le contraste
        const avg = (newR + newG + newB) / 3;
        if (avg > 128) {
            newR = Math.min(255, newR + 30);
            newG = Math.min(255, newG + 30);
            newB = Math.max(0, newB - 20);
        } else {
            newR = Math.max(0, newR - 20);
            newG = Math.max(0, newG - 20);
            newB = Math.max(0, newB - 30);
        }
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    createMonetPalette(color) {
        // Palette Monet : pastels doux, tons impressionnistes
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Transformation vers la palette Monet
        let newR = r, newG = g, newB = b;
        
        // Adoucir les couleurs (pastels)
        newR = Math.min(255, Math.floor(r * 0.8) + 50);
        newG = Math.min(255, Math.floor(g * 0.8) + 50);
        newB = Math.min(255, Math.floor(b * 0.8) + 50);
        
        // Ajouter des tons impressionnistes
        if (r > g && r > b) {
            newG = Math.min(255, newG + 20);
            newB = Math.min(255, newB + 15);
        } else if (g > r && g > b) {
            newR = Math.min(255, newR + 15);
            newB = Math.min(255, newB + 20);
        } else if (b > r && b > g) {
            newR = Math.min(255, newR + 15);
            newG = Math.min(255, newG + 20);
        }
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    createCyberpunkPalette(color) {
        // Palette Cyberpunk : néons vifs, violets, cyans électriques
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Transformation vers la palette Cyberpunk
        let newR = r, newG = g, newB = b;
        
        // Ajouter des tons néon
        newR = Math.min(255, r + 40);
        newG = Math.min(255, g + 30);
        newB = Math.min(255, b + 50);
        
        // Ajouter des tons cyberpunk (violet, cyan)
        if (r > g && r > b) {
            // Rouge → Violet néon
            newR = Math.min(255, newR + 20);
            newB = Math.min(255, newB + 40);
        } else if (g > r && g > b) {
            // Vert → Cyan électrique
            newG = Math.min(255, newG + 30);
            newB = Math.min(255, newB + 50);
        } else if (b > r && b > g) {
            // Bleu → Bleu néon intense
            newR = Math.min(255, newR + 20);
            newB = Math.min(255, newB + 30);
        }
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    getStyleParticleSize(style, pressure) {
        const baseSize = (pressure || 0.5) * 5 + 2;
        
        switch (style) {
            case 'van_gogh':
                return baseSize * 1.2; // Plus grandes
            case 'kandinsky':
                return baseSize * 0.8; // Plus petites, géométriques
            case 'picasso':
                return baseSize * 1.1; // Taille moyenne
            case 'monet':
                return baseSize * 0.9; // Plus douces
            case 'cyberpunk':
                return baseSize * 1.3; // Plus grandes, néon
            default:
                return baseSize;
        }
    }
    
    drawStyleParticle(particle, style, size) {
        switch (style) {
            case 'van_gogh':
                // Forme organique avec variations - coups de pinceau tourbillonnants
                const variation = Math.random() * 0.4;
                const rotation = Math.random() * Math.PI * 2;
                particle.rotation = rotation;
                particle.drawEllipse(0, 0, size * (1 + variation), size * (1 - variation * 0.5));
                // Ajouter des détails organiques
                if (Math.random() > 0.7) {
                    particle.drawEllipse(0, 0, size * 0.6, size * 0.3);
                }
                break;
            case 'kandinsky':
                // Formes géométriques pures - abstraction
                const shapeType = Math.floor(Math.random() * 4);
                switch (shapeType) {
                    case 0: // Carré
                        particle.drawRect(-size/2, -size/2, size, size);
                        break;
                    case 1: // Triangle
                        particle.moveTo(0, -size/2);
                        particle.lineTo(-size/2, size/2);
                        particle.lineTo(size/2, size/2);
                        particle.lineTo(0, -size/2);
                        break;
                    case 2: // Cercle
                        particle.drawCircle(0, 0, size);
                        break;
                    case 3: // Ligne
                        particle.moveTo(-size/2, 0);
                        particle.lineTo(size/2, 0);
                        break;
                }
                break;
            case 'picasso':
                // Formes fragmentées et angulaires - cubisme
                const segments = Math.floor(Math.random() * 4) + 3;
                const centerX = (Math.random() - 0.5) * size * 0.3;
                const centerY = (Math.random() - 0.5) * size * 0.3;
                for (let i = 0; i < segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
                    particle.moveTo(centerX, centerY);
                    particle.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                    particle.lineTo(Math.cos(nextAngle) * size, Math.sin(nextAngle) * size);
                    particle.lineTo(centerX, centerY);
                }
                break;
            case 'monet':
                // Formes douces et arrondies - impressionnisme
                particle.drawCircle(0, 0, size);
                // Ajouter des couches pour l'effet impressionniste
                if (Math.random() > 0.6) {
                    particle.drawCircle(0, 0, size * 0.7);
                }
                if (Math.random() > 0.8) {
                    particle.drawCircle(0, 0, size * 0.4);
                }
                break;
            case 'cyberpunk':
                // Formes néon avec lueur et effets futuristes
                particle.drawCircle(0, 0, size);
                // Contour néon blanc
                particle.lineStyle(3, 0xFFFFFF, 0.9);
                particle.drawCircle(0, 0, size + 2);
                // Lueur interne
                particle.lineStyle(1, 0xFFFFFF, 0.6);
                particle.drawCircle(0, 0, size * 0.6);
                break;
            default:
                particle.drawCircle(0, 0, size);
        }
    }
    
    getStyleParticleMovement(style, x, y) {
        const baseSpread = 30;
        const baseVelocity = 6;
        
        switch (style) {
            case 'van_gogh':
                // Mouvement organique et turbulent - coups de pinceau tourbillonnants
                const vgAngle = Math.random() * Math.PI * 2;
                const vgTurbulence = Math.random() * 0.5 + 0.5;
                return {
                    posX: x + Math.cos(vgAngle) * baseSpread * 1.8 * vgTurbulence,
                    posY: y + Math.sin(vgAngle) * baseSpread * 1.8 * vgTurbulence,
                    velX: Math.cos(vgAngle) * baseVelocity * 1.5 * vgTurbulence,
                    velY: Math.sin(vgAngle) * baseVelocity * 1.5 * vgTurbulence
                };
            case 'kandinsky':
                // Mouvement géométrique et directionnel - abstraction pure
                const kgAngle = Math.floor(Math.random() * 8) * (Math.PI / 4); // 8 directions
                const kgDistance = Math.random() * baseSpread * 0.9;
                return {
                    posX: x + Math.cos(kgAngle) * kgDistance,
                    posY: y + Math.sin(kgAngle) * kgDistance,
                    velX: Math.cos(kgAngle) * baseVelocity * 0.8,
                    velY: Math.sin(kgAngle) * baseVelocity * 0.8
                };
            case 'picasso':
                // Mouvement fragmenté et angulaire - cubisme
                const pgSegments = 6;
                const pgSegment = Math.floor(Math.random() * pgSegments);
                const pgSegmentAngle = (pgSegment / pgSegments) * Math.PI * 2;
                const pgFragmentation = Math.random() * 0.4 + 0.6;
                return {
                    posX: x + Math.cos(pgSegmentAngle) * baseSpread * 0.7 * pgFragmentation,
                    posY: y + Math.sin(pgSegmentAngle) * baseSpread * 0.7 * pgFragmentation,
                    velX: Math.cos(pgSegmentAngle) * baseVelocity * 1.1 * pgFragmentation,
                    velY: Math.sin(pgSegmentAngle) * baseVelocity * 1.1 * pgFragmentation
                };
            case 'monet':
                // Mouvement doux et fluide - impressionnisme
                const monAngle = Math.random() * Math.PI * 2;
                const monSoftness = Math.random() * 0.3 + 0.7;
                return {
                    posX: x + Math.cos(monAngle) * baseSpread * 0.8 * monSoftness,
                    posY: y + Math.sin(monAngle) * baseSpread * 0.8 * monSoftness,
                    velX: Math.cos(monAngle) * baseVelocity * 0.9 * monSoftness,
                    velY: Math.sin(monAngle) * baseVelocity * 0.9 * monSoftness
                };
            case 'cyberpunk':
                // Mouvement rapide et futuriste - néon électrique
                const cpAngle = Math.random() * Math.PI * 2;
                const cpIntensity = Math.random() * 0.5 + 1.5;
                return {
                    posX: x + Math.cos(cpAngle) * baseSpread * 2.2 * cpIntensity,
                    posY: y + Math.sin(cpAngle) * baseSpread * 2.2 * cpIntensity,
                    velX: Math.cos(cpAngle) * baseVelocity * 2.0 * cpIntensity,
                    velY: Math.sin(cpAngle) * baseVelocity * 2.0 * cpIntensity
                };
            default:
                return {
                    posX: x + (Math.random() - 0.5) * baseSpread,
                    posY: y + (Math.random() - 0.5) * baseSpread,
                    velX: (Math.random() - 0.5) * baseVelocity,
                    velY: (Math.random() - 0.5) * baseVelocity
                };
        }
    }
    
    getStyleParticleLife(style) {
        const baseLife = Math.random() * 80 + 40;
        
        switch (style) {
            case 'van_gogh':
                return baseLife * 1.2; // Plus longues
            case 'kandinsky':
                return baseLife * 0.8; // Plus courtes
            case 'picasso':
                return baseLife * 1.0; // Standard
            case 'monet':
                return baseLife * 1.1; // Légèrement plus longues
            case 'cyberpunk':
                return baseLife * 1.5; // Beaucoup plus longues
            default:
                return baseLife;
        }
    }
    
    // ===== Méthodes de Style pour Trails =====
    
    getStyleTrailSize(style) {
        const baseSize = Math.random() * 12 + 6;
        
        switch (style) {
            case 'van_gogh':
                return baseSize * 1.3; // Plus grandes
            case 'kandinsky':
                return baseSize * 0.7; // Plus petites, géométriques
            case 'picasso':
                return baseSize * 1.0; // Standard
            case 'monet':
                return baseSize * 0.9; // Plus douces
            case 'cyberpunk':
                return baseSize * 1.4; // Plus grandes, néon
            default:
                return baseSize;
        }
    }
    
    drawStyleTrail(trail, style, size) {
        switch (style) {
            case 'van_gogh':
                // Forme organique avec variations - coups de pinceau tourbillonnants
                const vgRotation = Math.random() * Math.PI * 2;
                trail.rotation = vgRotation;
                trail.drawEllipse(0, 0, size * 1.3, size * 0.7);
                // Ajouter des détails organiques
                if (Math.random() > 0.6) {
                    trail.drawEllipse(0, 0, size * 0.8, size * 0.4);
                }
                break;
            case 'kandinsky':
                // Formes géométriques pures - abstraction
                const kgShapeType = Math.floor(Math.random() * 3);
                switch (kgShapeType) {
                    case 0: // Diamant
                        trail.drawPolygon([
                            0, -size/2,
                            size/2, 0,
                            0, size/2,
                            -size/2, 0
                        ]);
                        break;
                    case 1: // Rectangle
                        trail.drawRect(-size/2, -size/2, size, size);
                        break;
                    case 2: // Cercle
                        trail.drawCircle(0, 0, size);
                        break;
                }
                break;
            case 'picasso':
                // Formes fragmentées et angulaires - cubisme
                const pgSegments = Math.floor(Math.random() * 3) + 3;
                const pgCenterX = (Math.random() - 0.5) * size * 0.2;
                const pgCenterY = (Math.random() - 0.5) * size * 0.2;
                for (let i = 0; i < pgSegments; i++) {
                    const angle = (i / pgSegments) * Math.PI * 2;
                    const nextAngle = ((i + 1) / pgSegments) * Math.PI * 2;
                    trail.moveTo(pgCenterX, pgCenterY);
                    trail.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                    trail.lineTo(Math.cos(nextAngle) * size, Math.sin(nextAngle) * size);
                    trail.lineTo(pgCenterX, pgCenterY);
                }
                break;
            case 'monet':
                // Formes douces et arrondies - impressionnisme
                trail.drawCircle(0, 0, size);
                // Ajouter des couches pour l'effet impressionniste
                if (Math.random() > 0.5) {
                    trail.drawCircle(0, 0, size * 0.8);
                }
                if (Math.random() > 0.7) {
                    trail.drawCircle(0, 0, size * 0.5);
                }
                break;
            case 'cyberpunk':
                // Formes néon avec lueur et effets futuristes
                trail.drawCircle(0, 0, size);
                // Contour néon blanc
                trail.lineStyle(4, 0xFFFFFF, 0.95);
                trail.drawCircle(0, 0, size + 3);
                // Lueur interne
                trail.lineStyle(2, 0xFFFFFF, 0.7);
                trail.drawCircle(0, 0, size * 0.7);
                // Effet de grille
                if (Math.random() > 0.7) {
                    trail.lineStyle(1, 0xFFFFFF, 0.5);
                    trail.drawRect(-size/2, -size/2, size, size);
                }
                break;
            default:
                trail.drawCircle(0, 0, size);
        }
    }
    
    getStyleTrailPosition(style, x, y) {
        const baseSpread = 15;
        
        switch (style) {
            case 'van_gogh':
                return {
                    posX: x + (Math.random() - 0.5) * baseSpread * 1.5,
                    posY: y + (Math.random() - 0.5) * baseSpread * 1.5
                };
            case 'kandinsky':
                // Position géométrique
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * baseSpread * 0.8;
                return {
                    posX: x + Math.cos(angle) * distance,
                    posY: y + Math.sin(angle) * distance
                };
            case 'picasso':
                // Position fragmentée
                const segments = 4;
                const segment = Math.floor(Math.random() * segments);
                const segmentAngle = (segment / segments) * Math.PI * 2;
                return {
                    posX: x + Math.cos(segmentAngle) * baseSpread * 0.6,
                    posY: y + Math.sin(segmentAngle) * baseSpread * 0.6
                };
            case 'monet':
                return {
                    posX: x + (Math.random() - 0.5) * baseSpread * 0.7,
                    posY: y + (Math.random() - 0.5) * baseSpread * 0.7
                };
            case 'cyberpunk':
                return {
                    posX: x + (Math.random() - 0.5) * baseSpread * 2.0,
                    posY: y + (Math.random() - 0.5) * baseSpread * 2.0
                };
            default:
                return {
                    posX: x + (Math.random() - 0.5) * baseSpread,
                    posY: y + (Math.random() - 0.5) * baseSpread
                };
        }
    }
    
    getStyleTrailAlpha(style) {
        switch (style) {
            case 'van_gogh':
                return 0.8; // Plus visible
            case 'kandinsky':
                return 0.6; // Plus subtil
            case 'picasso':
                return 0.7; // Standard
            case 'monet':
                return 0.5; // Plus doux
            case 'cyberpunk':
                return 0.9; // Très visible, néon
            default:
                return 0.7;
        }
    }
    
    // ===== Gestion des traînées =====
    
    addTrail(x, y, color, style = 'van_gogh') {
        if (this.trails.length >= this.effects.trails.maxCount) return;
        
        const trail = new PIXI.Graphics();
        
        // Appliquer le style aux trails
        const styledColor = this.applyStyleToColor(color, style);
        trail.beginFill(styledColor);
        
        // Forme selon le style
        const size = this.getStyleTrailSize(style);
        this.drawStyleTrail(trail, style, size);
        trail.endFill();
        
        // Position selon le style
        const { posX, posY } = this.getStyleTrailPosition(style, x, y);
        trail.x = posX;
        trail.y = posY;
        trail.life = 1.0;
        trail.alpha = this.getStyleTrailAlpha(style);
        
        this.app.stage.addChild(trail);
        this.trails.push(trail);
    }
    
    // ===== Gestion des traits (pour statistiques) =====
    
    addStrokeSegment(x1, y1, x2, y2, color, size, pressure, clientId) {
        // Garder la logique des traits pour les statistiques
        // mais ne pas les afficher visuellement
        const now = Date.now();
        
        let currentStroke = this.strokes.find(stroke => 
            stroke.clientId === clientId && 
            stroke.isActive && 
            (now - stroke.lastUpdate) < 500
        );
        
        if (!currentStroke) {
            currentStroke = {
                id: `stroke_${now}_${clientId}`,
                clientId: clientId,
                segments: [],
                color: color,
                createdAt: now,
                lastUpdate: now,
                isActive: true
            };
            
            this.strokes.push(currentStroke);
            
            if (this.strokes.length > 50) {
                this.strokes.shift();
            }
        }
        
        currentStroke.segments.push({
            x1, y1, x2, y2, 
            size: size * (pressure || 1),
            timestamp: now
        });
        
        currentStroke.lastUpdate = now;
    }
    
    // ===== Mise à jour des effets =====
    
    update() {
        // Mettre à jour les particules
        this.updateParticles();
        
        // Mettre à jour les traînées
        this.updateTrails();
        
        // Mettre à jour les traits (pour statistiques)
        this.updateStrokes();
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Mouvement
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Vie et transparence
            particle.life -= 1 / particle.maxLife;
            particle.alpha = particle.life;
            
            // Supprimer si mort
            if (particle.life <= 0) {
                this.app.stage.removeChild(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateTrails() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            
            trail.life -= this.effects.trails.fadeRate;
            trail.alpha = trail.life * 0.7;
            
            if (trail.life <= 0) {
                this.app.stage.removeChild(trail);
                this.trails.splice(i, 1);
            }
        }
    }
    
    updateStrokes() {
        const now = Date.now();
        
        this.strokes.forEach(stroke => {
            const timeSinceLastUpdate = now - stroke.lastUpdate;
            
            if (timeSinceLastUpdate > 500) {
                stroke.isActive = false;
            }
            
            // Filtrer les segments expirés
            stroke.segments = stroke.segments.filter(segment => {
                const segmentAge = now - segment.timestamp;
                return segmentAge < 3000; // 3 secondes par défaut
            });
        });
        
        // Supprimer les traits vides
        this.strokes = this.strokes.filter(stroke => stroke.segments.length > 0);
    }
    
    // ===== Contrôles =====
    
    clearCanvas() {
        // Supprimer tous les effets visuels
        this.particles.forEach(particle => {
            this.app.stage.removeChild(particle);
        });
        this.particles = [];
        
        this.trails.forEach(trail => {
            this.app.stage.removeChild(trail);
        });
        this.trails = [];
        
        this.strokes = [];
        
        console.log('🧹 Canvas PixiJS effacé');
    }
    
    setStrokeTimeout(timeout) {
        // Configurer le timeout des segments
        console.log(`⏰ Timeout des segments défini à ${timeout}ms`);
    }
    
    // ===== Utilitaires =====
    
    hexColor(cssColor) {
        // Convertir CSS color en hex pour PixiJS
        if (cssColor.startsWith('#')) {
            return parseInt(cssColor.slice(1), 16);
        }
        
        // Fallback pour les couleurs nommées
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = cssColor;
        return parseInt(ctx.fillStyle.slice(1), 16);
    }
    
    getStats() {
        return {
            particles: this.particles.length,
            trails: this.trails.length,
            strokes: this.strokes.length,
            fps: this.app.ticker.FPS
        };
    }
    
    // ===== Destruction =====
    
    destroy() {
        if (this.app) {
            this.app.destroy(true);
        }
        console.log('🗑️ PixiJS LED Renderer détruit');
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PixiLEDRenderer;
}
