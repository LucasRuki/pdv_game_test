import Player from '../classes/Player.js';
import Cpu from '../classes/Cpu.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.timerEvent = null;
        this.gameEnded = false;
        this.lastJokerSpawnTime = 0; // Adiciona uma variável para rastrear o tempo do último joker
        this.pointCounter = 0;
        this.debitCounter = 0;
        this.gameStarted = false; // Adicione esta flag
    }

    create() {

        // Cria o botão de start
        this.createStartButton();
        // Cria o grupo de estrelas primeiro (mais ao fundo)
        this.stars = this.add.group();
        
        // Configurações das estrelas
        this.starCount = 100;
        this.starSpeed = 0.5;
        
        // Cria as estrelas iniciais
        for (let i = 0; i < this.starCount; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.FloatBetween(1, 2.5);
            const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
            
            const star = this.add.rectangle(x, y, size, size, 0x0098db, alpha);
            star.setDepth(-2);
            this.stars.add(star);
        }

        // Cria o grupo de linhas da grade
        this.gridLines = this.add.group();
        
        // Configurações da grade
        this.gridSize = 42;
        this.gridColor = 0x252446;
        this.gridAlpha = 1;

        // Raios diferentes para cada tipo de elemento
        this.gridRadius = {
            player: 8,
            cpu: 5,
            bullet: 3
        };

        // Coloca a grade em uma camada inferior
        this.gridLines.setDepth(-1);

        // Agora cria o player e outros elementos
        this.player = new Player(
            this, 
            this.cameras.main.centerX, 
            this.cameras.main.height - 100
        );
        this.player.setDepth(1); // Garante que o player fique acima da grade

        // Adiciona física ao player
        this.physics.add.existing(this.player);

        /*
        // Cria CPUs periodicamente
        this.cpuSpawnEvent = this.time.addEvent({
            delay: 1800,           // A cada 2 segundos
            callback: this.spawnCpu,
            callbackScope: this,
            loop: true
        });
        */

        // Cria o temporizador de 3 minutos
        this.timerEvent = this.time.addEvent({
            delay: 180000, // 3 minutos em milissegundos
            callback: () => {
                console.log('Timer acabou!'); // Debug
                this.showGameOver();
            },
            callbackScope: this
        });

        // Dimensões e posição da barra
        const barWidth = 300;
        const barHeight = 20;
        const x = this.cameras.main.centerX - (barWidth / 2);
        const y = 20;

        // Barra de fundo (cinza)
        this.barBackground = this.add.rectangle(x, y, barWidth, barHeight, 0x333333);
        this.barBackground.setOrigin(0, 0);

        // Barra de progresso
        this.progressBar = this.add.rectangle(x, y, 0, barHeight, 0x00ff00);
        this.progressBar.setOrigin(0, 0);


        // Valor atual do progresso (0-100)
        this.progressValue = 0;

        // Inicializa os controles do teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // Grupo para armazenar os projéteis
        this.bullets = this.physics.add.group();
        
        // Adicione no create():
        this.cpusGroup = this.add.group();
        
        /*
        // Timer para controlar a frequência dos tiros
        this.lastShot = 0;
        this.shootDelay = 250; // Delay entre tiros em milissegundos
        */

        // Cria o texto para exibir o tempo restante
        this.timerText = this.add.text(
            80,
            20, 
            '3 minutos', 
            { 
                fontFamily: 'PixelLcd',
                fontSize: '32px', 
                fill: '#ffffff' 
            }
        );
        this.timerText.setOrigin(0, 0);

        // Velocidade de movimento lateral
        this.moveSpeed = 400;

        // Inicializa flags dos powerups
        this.isInverseActive = false;
        this.isWonderGuardActive = false;
        this.isFreezeActive = false;
        this.isNightmareActive = false;  // Adiciona flag do nightmare
        this.nightmareTimer = null;

        // Inicializa textos de resultado
        this.resultTexts = {
            zero: [
                "Sem cupom :(",
                "Tente novamente para ganhar descontos!",
                null  // sem sprite
            ],
            low: [
                "Cupom Recebido!",
                "Mostre isso ao atendente!",
                "cupom_bronze"  // nome do sprite para 1-50%
            ],
            medium: [
                "Cupom Recebido!",
                "Mostre isso ao atendente!",
                "cupom_prata"  // nome do sprite para 50-75%
            ],
            high: [
                "Cupom Recebido!",
                "Mostre isso ao atendente!",
                "cupom_ouro"  // nome do sprite para 76-99%
            ],
            max: [
                "Cupom Recebido!",
                "Mostre isso ao atendente!",
                "cupom_platinum"  // nome do sprite para 100%
            ]
        };

        // Adiciona teclas de debug
        this.debugKeys = this.input.keyboard.addKeys({
            add: Phaser.Input.Keyboard.KeyCodes.P,     // Tecla P para aumentar a barra
            reduce: Phaser.Input.Keyboard.KeyCodes.O,  // Tecla O para reduzir o tempo
        });

        // Adiciona um evento para verificar CPUs que saem da tela
        this.events.on('update', this.checkCpuBounds, this);

        // Cria o botão de tiro usando um sprite
        this.shootButton = this.add.sprite(
            this.cameras.main.width - 80, // Posição X
            this.cameras.main.height - 80, // Posição Y
            'bshoot' // Substitua pelo nome da textura do sprite
        ).setOrigin(0.5).setInteractive().setAlpha(0.5)
        .on('pointerdown', () => {
            this.shoot(); // Chama a função de tiro
        });

        /*
        // Adiciona texto ao botão
        this.add.text(
            this.cameras.main.width - 100,
            this.cameras.main.height - 50,
            'Atirar',
            { fontFamily: 'PixelLcd', fontSize: '20px', fill: '#000000' }
        ).setOrigin(0.5);
        */

        // Adiciona evento de clique ao botão
        this.shootButton.on('pointerdown', () => {
            this.shoot(); // Chama a função de tiro
            this.shootButton.setAlpha(1)
        });
         
        this.shootButton.on('pointerup', () => {
            this.shootButton.setAlpha(0.5)
        });

        // Variáveis para controlar o estado dos botões
        this.isLeftPressed = false;
        this.isRightPressed = false;

        // Botão esquerda
        const leftButton = this.add.sprite(80, this.cameras.main.height - 80, 'bleft')
        .setInteractive()
        .setAlpha(0.5)
        .on('pointerdown', () => {
            this.isLeftPressed = true; // Botão pressionado
            leftButton.setAlpha(1)
        })
        .on('pointerup', () => {
            this.isLeftPressed = false; // Botão solto
            leftButton.setAlpha(0.5)
        })
        .on('pointerout', () => {
            this.isLeftPressed = false; // Caso o ponteiro saia do botão
            leftButton.setAlpha(0.5)
        });

        // Botão direita
        const rightButton =  this.add.sprite(250, this.cameras.main.height - 80, 'bright')
        .setInteractive()
        .setAlpha(0.5)
        .on('pointerdown', () => {
            this.isRightPressed = true;
            rightButton.setAlpha(1)
        })
        .on('pointerup', () => {
            this.isRightPressed = false;
            rightButton.setAlpha(0.5)
        })
        .on('pointerout', () => {
            this.isRightPressed = false;
            rightButton.setAlpha(0.5)
        });
    }

    createStartButton() {
        // Container principal
        this.startContainer = this.add.container(
            this.cameras.main.centerX / 2,
            this.cameras.main.centerY / 2
        ).setDepth(1000);
    
        // Botão de start
        const startButton = this.add.rectangle(
            this.cameras.main.centerX / 2,
            this.cameras.main.centerY / 2,
            380, 80,
            0xff0000, 0.8
        ).setOrigin(0.5)
         .setInteractive()
         .on('pointerdown', () => {
             this.startGame();
             this.startContainer.destroy();
         });
    
        // Texto do botão
        const buttonText = this.add.text(
            this.cameras.main.centerX / 2,
            this.cameras.main.centerY / 2,
            'Start Game',
            {
                fontFamily: 'Ash',
                fontSize: '28px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
    
        // Adiciona todos os elementos ao container
        this.startContainer.add([startButton, buttonText]);
    }

    startGame() {
        this.gameStarted = true;
        
        // Inicia o spawn de CPUs
        this.cpuSpawnEvent = this.time.addEvent({
            delay: 900,
            callback: this.spawnCpu,
            callbackScope: this,
            loop: true
        });
    
        // Inicia o timer
        this.timerEvent = this.time.addEvent({
            delay: 180000,
            callback: () => {
                console.log('Timer acabou!');
                this.showGameOver();
            },
            callbackScope: this
        });
    }

    createFullGrid() {
        // Cria um grupo para a grade completa
        this.fullGrid = this.add.group();
        
        // Tamanho da grade
        const gridSize = 42;
        
        // Cria a grade completa
        for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
            const line = this.add.line(x, 0, 0, 0, 0, this.cameras.main.height, 0x252446, 0.8);
            line.setDepth(-1);
            this.fullGrid.add(line);
        }
        
        for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
            const line = this.add.line(0, y, 0, 0, this.cameras.main.width, 0, 0x252446, 0.8);
            line.setDepth(-1);
            this.fullGrid.add(line);
        }
    }

    spawnCpu() {
        // Posição X aleatória no topo da tela
        const randomX = Phaser.Math.Between(0 + 80, this.cameras.main.width - 80);
        
        // Define os tipos possíveis de CPU
        const cpuTypes = [
            { type: 'point1', probability: 0.25 },
            { type: 'debit1', probability: 0.25 },
            { type: 'point2', probability: 0.15 },
            { type: 'debit2', probability: 0.15 },
            { type: 'joker_inverse', probability: 0.05 },
            { type: 'joker_wonderguard', probability: 0.05 },
            { type: 'joker_freeze', probability: 0.05 },
            { type: 'joker_nightmare', probability: 0.05 },
            { type: 'point3', probability: 0.15 },
            { type: 'debit3', probability: 0.15 }
        ];

        // Seleciona um tipo aleatório baseado na probabilidade
        const random = Math.random();
        let accumulatedProbability = 0;
        let selectedType = 'point1'; // Valor fallback

        // Verifica se precisamos forçar um tipo de CPU
        if (this.pointCounter >= 3) {
            selectedType = 'debit1'; // Força um debit após 3 points
            this.pointCounter = 0; // Reseta o contador
            this.debitCounter = 1; // Começa a contar debits
        } else if (this.debitCounter >= 3) {
            selectedType = 'point1'; // Força um point após 3 debits
            this.debitCounter = 0; // Reseta o contador
            this.pointCounter = 1; // Começa a contar points
        } else {
            for (const cpuType of cpuTypes) {
                // Verifica se o tipo é point3 e se as condições são atendidas
                if (cpuType.type === 'point3' && (this.timerEvent.getRemainingSeconds() > 90 || this.progressValue >= 40)) {
                    continue; // Não permite spawnar point3
                }

                // Verifica se o tipo é debit3 e se as condições são atendidas
                if (cpuType.type === 'debit3' && this.progressValue <= 60) {
                    continue; // Não permite spawnar debit3
                }

                // Verifica se o tipo é joker e se o tempo desde a última aparição é menor que 30 segundos
                if (cpuType.type.startsWith('joker') && (this.time.now - this.lastJokerSpawnTime < 30000)) {
                    continue; // Não permite spawnar um joker
                }

                accumulatedProbability += cpuType.probability;
                if (random <= accumulatedProbability) {
                    selectedType = cpuType.type;
                    break;
                }
            }
        }

        // Atualiza os contadores
        if (selectedType.startsWith('point')) {
            this.pointCounter++;
            this.debitCounter = 0;
        } else if (selectedType.startsWith('debit')) {
            this.debitCounter++;
            this.pointCounter = 0;
        }

        // Cria a CPU com alpha 0
        const cpu = new Cpu(this, randomX, -50, selectedType);
        cpu.originalTexture = selectedType; // Armazena a textura original

        // Se o modo nightmare está ativo, já spawna com a textura nightmare
        if (this.isNightmareActive) {
            cpu.setTexture('crystal_n');
            cpu.nightmareAffected = true; // Marca como afetado pelo Nightmare
        }

        // Atualiza o tempo da última aparição de joker se um joker foi gerado
        if (selectedType.startsWith('joker')) {
            this.lastJokerSpawnTime = this.time.now; // Atualiza o tempo
        }

        // Fade in quando entra na tela
        this.tweens.add({
            targets: cpu,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Linear'
        });

        this.cpusGroup.add(cpu);
    }

    checkCpuBounds() {
        if (this.gameEnded) return;

        this.children.list.forEach(child => {
            if (child instanceof Cpu) {
                // Se a CPU está entrando na tela (vindo de cima)
                if (child.y < 100) { // Aumentado para 100px
                    child.setAlpha(Math.min(1, (child.y + 50) / 100)); // Fade in mais gradual
                }
                // Se a CPU está saindo da tela (por baixo)
                else if (child.y > this.cameras.main.height - 100) { // Começa 100px antes do fim
                    child.setAlpha(Math.max(0, 1 - (child.y - (this.cameras.main.height - 100)) / 100)); // Fade out mais gradual
                }
                // Se a CPU já saiu completamente da tela
                if (child.y > this.cameras.main.height + 50) {
                    child.destroy();
                }
            }
        });
    }

    update(time) {

        if (!this.gameStarted || this.gameEnded) return; // Adicione esta verificação
        // Se o jogo acabou, não atualiza mais nada
        if (this.gameEnded) return;

        // Debug: aumenta a barra de progresso
        if (Phaser.Input.Keyboard.JustDown(this.debugKeys.add)) {
            this.updateProgressBar(this.progressValue + 10);
            console.log('Progresso atual:', this.progressValue);
        }

        // Debug: reduz 30 segundos do tempo
        if (Phaser.Input.Keyboard.JustDown(this.debugKeys.reduce)) {
            if (this.timerEvent) {
                const currentTime = this.timerEvent.getElapsed();
                const newTime = this.timerEvent.delay - currentTime - 30000; // Reduz 30 segundos
                
                // Destrói o timer atual e cria um novo com o tempo reduzido
                this.timerEvent.destroy();
                this.timerEvent = this.time.addEvent({
                    delay: newTime,
                    callback: () => {
                        console.log('Timer acabou!');
                        this.showGameOver();
                    },
                    callbackScope: this
                });
                
                console.log('Tempo reduzido em 30 segundos');
            }
        }

        // Atualiza a posição das estrelas
        this.updateStars();

        // Movimento lateral usando o corpo físico
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.moveSpeed;
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.moveSpeed;
        }
        else {
            // Para o movimento quando nenhuma tecla está pressionada
            this.player.body.velocity.x = 0;
        }

        // Limita o movimento dentro da tela
        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            this.player.width/2,
            this.cameras.main.width - this.player.width/2
        );

        // Mantém a rotação do player apontando para cima
        this.player.setRotation(0);

        // Combina entrada do teclado e botões virtuais
        let moveDirection = 0;
        if (this.cursors.left.isDown || this.isLeftPressed) {
            moveDirection = -1;
        } 
        else if (this.cursors.right.isDown || this.isRightPressed) {
            moveDirection = 1;
        }
        this.player.body.velocity.x = moveDirection * this.moveSpeed;

        /*
        // Verifica se existem CPUs na tela
        const hasCpus = this.children.list.some(child => child instanceof Cpu);
        
        
        // Se houver CPUs e passou o tempo de delay, atira
        if (hasCpus && time > this.lastShot) {
            this.shoot();
            this.lastShot = time + this.shootDelay;
        }
        */

        // Atualiza o tempo restante 
        if (this.timerEvent) {
            const remainingTime = Math.ceil(this.timerEvent.getRemainingSeconds());
            // Calcula minutos e segundos restantes
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            // Atualiza o texto com a formatação desejada
            if (minutes > 0) {
                this.timerText.setText(`${minutes} m ${seconds} s`);
            } else {
                this.timerText.setText(`${seconds} s`);
            }

            // Se o tempo está acabando (menos de 1 segundo), mostra game over
            if (remainingTime <= 0) {
                this.showGameOver();
            }
        }

        // Atualiza a grade
        this.updateGrid();

        // Chama checkCpuBounds aqui também para garantir que seja executado
        this.checkCpuBounds();
    }

    updateProgressBar(value) {
        // Garante que o valor esteja entre 0 e 100
        this.progressValue = Phaser.Math.Clamp(value, 0, 100);

        // Calcula a largura da barra baseada no progresso
        const width = (this.progressValue / 100) * this.barBackground.width;
        this.progressBar.width = width;

        // Atualiza a cor baseada no progresso
        const color = this.getProgressColor(this.progressValue);
        this.progressBar.setFillStyle(color);
    }

    getProgressColor(value) {
        // Define as cores para cada faixa de 20%
        if (value <= 20) return 0xfff54e;     
        if (value <= 40) return 0xb2e782;      
        if (value <= 60) return 0x8fd79f;
        if (value <= 80) return 0x70c4bc;
        return 0x4292b9;                      
    }

    timerEnded() {
        // Ação a ser tomada quando o timer acabar
        console.log('O tempo acabou!');
        this.showGameOver();
    }
    
    shoot() {
        // Cria o projétil na posição do player
        const bullet = this.add.rectangle(
            this.player.x,
            this.player.y - 20, // Um pouco acima do player
            8, 8,
            0xffffff
        );
        
        this.physics.add.existing(bullet);
        this.bullets.add(bullet);
        
        // Define velocidade vertical para cima
        bullet.body.setVelocityY(-900);

        // Adiciona colisão entre projétil e CPUs
        this.physics.add.overlap(bullet, this.cpusGroup, (bullet, target) => {
            if (target instanceof Cpu) {
                const cpuType = target.type;

                // Se wonderguard está ativo e o alvo é do tipo debit, não faz nada
                if (this.isWonderGuardActive && cpuType.startsWith('debit')) {
                    bullet.destroy();
                    return;
                }

                // Executa ações baseadas no tipo de CPU
                switch(cpuType) {
                    case 'point1':
                        this.updateProgressBar(this.progressValue + (this.isInverseActive ? -1 : 1));
                        bullet.destroy(true);
                        break;
                    case 'point2':
                        this.updateProgressBar(this.progressValue + (this.isInverseActive ? -2 : 2));
                        bullet.destroy(true);
                        break;
                    case 'point3':
                        this.updateProgressBar(this.progressValue + (this.isInverseActive ? -3 : 3));
                        bullet.destroy(true);
                        break;
                    case 'debit1':
                        this.updateProgressBar(this.progressValue + (this.isInverseActive ? 1 : -1));
                        bullet.destroy(true);
                        break;
                    case 'debit2':
                        this.updateProgressBar(this.progressValue + (this.isInverseActive ? 2 : -2));
                        bullet.destroy(true);
                        break;
                    case 'debit3':
                        this.updateProgressBar(this.progressValue + (this.isInverseActive ? 3 : -3));
                        bullet.destroy(true);
                        break;
                    case 'joker_inverse':
                    case 'joker_wonderguard':
                    case 'joker_freeze':
                    case 'joker_nightmare':
                        this.activatePowerUp(cpuType);
                        break;
                }

                target.destroy();
                return;
            }
        });

        // Remove o projétil quando sair da tela
        bullet.body.onWorldBounds = true;
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === bullet) {
                bullet.destroy();
            }
        });

       bullet.body.setCollideWorldBounds(true);

    }

    activatePowerUp(powerUpType) {
        // Verifica se já existe algum powerup ativo
        if (this.isInverseActive || this.isWonderGuardActive || this.isFreezeActive) {
            return;
        }

        let powerUpDuration;
        let powerUpText;
        let textDisplay; // Mover a declaração para fora do switch

        switch(powerUpType) {
            case 'joker_inverse':
                powerUpDuration = 10000;
                this.isInverseActive = true;
                this.player.setTexture('player_r');
                powerUpText = 'INVERSE MODE!';
                break;
            
            case 'joker_wonderguard':
                powerUpDuration = 10000;
                this.isWonderGuardActive = true;
                this.player.setTexture('player_y');
                powerUpText = 'WONDERGUARD MODE!';
                break;
            
            case 'joker_freeze':
                powerUpDuration = 15000;
                this.isFreezeActive = true;
                powerUpText = 'TIME FREEZE!';
                
                if (this.timerEvent) {
                    this.timerEvent.paused = true;
                }
                break;

            case 'joker_nightmare':
                this.activateNightmare();
                powerUpText = 'NIGHTMARE MODE!';
                break;
        }
        
        // Exibir texto na tela
        textDisplay = this.add.text(
            this.cameras.main.width - 80,
            20,
            powerUpText,
            { 
                fontFamily: 'PixelLcd',
                fontSize: '32px', 
                fill: '#ffff00' 
            }
        ).setOrigin(1,0);
        
        // Se for o modo nightmare, não destruir o texto automaticamente
        if (powerUpType === 'joker_nightmare') {
            this.nightmareTextDisplay = textDisplay; // Armazena a referência do texto
        } else {
            this.time.delayedCall(powerUpDuration, () => {
                this.isInverseActive = false;
                this.isWonderGuardActive = false;
                
                if (powerUpType === 'joker_freeze') {
                    this.isFreezeActive = false;
                    if (this.timerEvent) {
                        this.timerEvent.paused = false;
                    }
                }
                
                this.player.setTexture('player_g');
                textDisplay.destroy();
                
                this.add.text(
                    this.cameras.main.centerX,
                    100,
                    'Power Up Ended',
                    { 
                        fontFamily: 'PixelLcd',
                        fontSize: '24px', 
                        fill: '#ff0000' 
                    }
                ).setOrigin(0.5)
                .setAlpha(1)
                .setDepth(1000)
                .setScrollFactor(0)
                .destroy(1000);
            });
        }
    }

    activateNightmare() {
        // Se já existe um timer ativo, limpa ele e reinicia
        if (this.nightmareTimer) {
            this.nightmareTimer.destroy();
        }

        // Ativa o modo nightmare
        this.isNightmareActive = true;

        // Aplica o efeito em todas as CPUs existentes
        this.children.list.forEach(child => {
            if (child instanceof Cpu) {
                child.setTexture('crystal_n'); // Muda a textura para 'nightmare'
                child.nightmareAffected = true; // Marca como afetado pelo Nightmare
            }
        });

        //Aplica o efeito no Player
        this.player.setTexture('player_n'); 

        // Cria o timer para desativar o efeito
        this.nightmareTimer = this.time.delayedCall(15000, () => {
            this.player.setTexture('player_g'); 
            this.isNightmareActive = false;

            // Restaura as texturas originais apenas se não foram afetadas
            this.children.list.forEach(child => {
                if (child instanceof Cpu && !child.nightmareAffected) {
                    child.setTexture(child.originalTexture); // Restaura a textura original
                }
            });

            // Destrói o texto do Nightmare Mode
            if (this.nightmareTextDisplay) {
                this.nightmareTextDisplay.destroy();
                this.nightmareTextDisplay = null; // Limpa a referência
            }
        });
    }

    updateGrid() {
        // Limpa as linhas antigas
        this.gridLines.clear(true, true);
        
        // Conjunto para evitar duplicatas de células
        const cellsToShow = new Set();
        
        // Função para calcular distância entre dois pontos de forma mais suave
        const getDistance = (x1, y1, x2, y2) => {
            const dx = x1 - x2;
            const dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        };
        
        // Função para adicionar células em um raio circular com transição suave
        const addCellsInRadius = (element, radius) => {
            const centerX = Math.floor(element.x / this.gridSize);
            const centerY = Math.floor(element.y / this.gridSize);
            
            // Aumenta a área de verificação para ter mais células e transição mais suave
            const checkRadius = radius + 1;
            
            for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                    const exactDistance = getDistance(0, 0, dx, dy);
                    
                    // Usa uma função de suavização para criar uma transição mais gradual
                    if (exactDistance <= radius) {
                        // Calcula posição exata da célula
                        const cellX = centerX + dx;
                        const cellY = centerY + dy;
                        
                        // Adiciona a célula se estiver dentro do raio
                        cellsToShow.add(`${cellX},${cellY}`);
                    }
                }
            }
        };
        
        // Adiciona células para o player com raio maior
        addCellsInRadius(this.player, this.gridRadius.player);
        
        // Adiciona células para as CPUs
        this.children.list
            .filter(child => child instanceof Cpu)
            .forEach(cpu => addCellsInRadius(cpu, this.gridRadius.cpu));
        
        // Adiciona células para os projéteis
        this.bullets.getChildren()
            .forEach(bullet => addCellsInRadius(bullet, this.gridRadius.bullet));
        
        // Desenha as linhas da grade para as células selecionadas
        cellsToShow.forEach(cell => {
            const [x, y] = cell.split(',').map(Number);
            
            // Desenha as linhas com uma espessura menor para mais suavidade
            const verticalLine = this.add.line(
                x * this.gridSize,
                y * this.gridSize,
                0,
                0,
                0,
                this.gridSize,
                this.gridColor,
                this.gridAlpha
            ).setDepth(-1);
            
            const horizontalLine = this.add.line(
                x * this.gridSize,
                y * this.gridSize,
                0,
                0,
                this.gridSize,
                0,
                this.gridColor,
                this.gridAlpha
            ).setDepth(-1);
            
            this.gridLines.add(verticalLine);
            this.gridLines.add(horizontalLine);
        });
    }

    updateStars() {
        this.stars.getChildren().forEach(star => {
            // Move a estrela para baixo
            star.y += this.starSpeed;
            
            // Se a estrela sair da tela, reposiciona no topo
            if (star.y > this.cameras.main.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.cameras.main.width);
                star.alpha = Phaser.Math.FloatBetween(0.3, 1);
            }
        });
    }

    showGameOver() {

        console.log('Mostrando game over...'); // Debug
        
        // Marca o jogo como terminado e para eventos
        this.gameEnded = true;
        if (this.cpuSpawnEvent) this.cpuSpawnEvent.destroy();
        if (this.timerEvent) this.timerEvent.destroy();
        if (this.timerText) this.timerText.setText('0 s');

        // Cria overlay
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.3
        );
        overlay.setDepth(1000);

        // Determina qual conjunto de textos/sprite usar
        let resultText;
        if (this.progressValue === 0) {
            resultText = this.resultTexts.zero;
        } else if (this.progressValue <= 50) {
            resultText = this.resultTexts.low;
        } else if (this.progressValue <= 75) {
            resultText = this.resultTexts.medium;
        } else if (this.progressValue <= 99) {
            resultText = this.resultTexts.high;
        } else {
            resultText = this.resultTexts.max;
        }

        // Container para centralizar tudo
        const container = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50  // Ajustado para cima para acomodar o sprite
        );
        container.setDepth(1001);

        // Título
        const title = this.add.text(
            0,
            -100,
            resultText[0],
            {
                fontFamily: 'Ash',
                fontSize: '42px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        container.add(title);

        // Adiciona sprite se houver (exceto para 0%)
        if (resultText[2]) {
            const sprite = this.add.sprite(0, 0, resultText[2]);
            sprite.setScale(0.5); // Ajuste a escala conforme necessário
            container.add(sprite);

            // Texto abaixo do sprite
            const instructionText = this.add.text(
                0,
                sprite.displayHeight/2 + 20,
                resultText[1],
                {
                    fontFamily: 'Ash',
                    fontSize: '24px',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);
            container.add(instructionText);
        } else {
            // Se não há sprite (0%), mostra apenas o texto de incentivo
            const noRewardText = this.add.text(
                0,
                0,
                resultText[1],
                {
                    fontFamily: 'Ash',
                    fontSize: '24px',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);
            container.add(noRewardText);
        }

        // Pontuação
        const scoreText = this.add.text(
            0,
            100,
            `Progresso: ${this.progressValue}%`,
            {
                fontFamily: 'Ash',
                fontSize: '24px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        container.add(scoreText);

        // Botão de reiniciar
        const restartButton = this.add.rectangle(0, 170, 400, 50, 0xff0000);
        const restartText = this.add.text(
            0,
            170,
            'Jogar Novamente',
            {
                fontFamily: 'Ash',
                fontSize: '20px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        container.add([restartButton, restartText]);

        // Efeito de fade in
        this.tweens.add({
            targets: [overlay, container],
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2'
        });
    }

    // Método para mover o jogador
    movePlayer(direction) {
        const speed = 200; // Velocidade de movimento
        this.player.setVelocityX(direction * speed); // Move o jogador na direção especificada
    }

    // Método para parar o movimento do jogador
    stopPlayer() {
        this.player.setVelocityX(0); // Para o movimento do jogador
    }
}

