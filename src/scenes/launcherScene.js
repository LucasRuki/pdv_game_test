export default class LauncherScene extends Phaser.Scene {
    constructor() {
        super('LauncherScene');
    }

    create() {
        // Adiciona título
        const title = this.add.text(
            this.cameras.main.centerX,
            100,
            'Digite o código de validação',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Cria o elemento HTML para input
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Código';
        input.style.padding = '10px';
        input.style.width = '200px';
        input.style.textAlign = 'center';
        input.style.fontSize = '18px';
        input.style.borderRadius = '5px';
        input.style.border = '2px solid #0098db';
        input.style.backgroundColor = '#000';
        input.style.color = '#fff';
        input.style.fontFamily = 'Arial';

        // Adiciona o input ao DOM usando createElement
        const element = this.add.dom(
            this.cameras.main.centerX,
            200,
            input
        ).setOrigin(0.5);

        // Debug: verifica se o elemento foi criado
        console.log('Input element created:', element);

        // Cria o botão de validação
        const validateButton = this.add.rectangle(
            this.cameras.main.centerX,
            300,
            200,
            50,
            0x0098db
        );

        // Texto do botão
        const buttonText = this.add.text(
            this.cameras.main.centerX,
            300,
            'Validar',
            {
                fontFamily: 'PixelLcd',
                fontSize: '24px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Mensagem de erro (inicialmente invisível)
        const errorMessage = this.add.text(
            this.cameras.main.centerX,
            350,
            'Código inválido!',
            {
                fontFamily: 'PixelLcd',
                fontSize: '20px',
                fill: '#ff0000'
            }
        ).setOrigin(0.5).setAlpha(0);

        // Adiciona interatividade ao botão
        validateButton.setInteractive();
        validateButton.on('pointerdown', () => {
            const code = input.value.toLowerCase();
            if (code === 'pdvgame25') {
                // Código correto - transição para GameScene
                this.cameras.main.fade(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('GameScene');
                });
            } else {
                // Código incorreto - mostra mensagem de erro
                errorMessage.setAlpha(1);
                this.tweens.add({
                    targets: errorMessage,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Linear'
                });
            }
        });

        // Efeito hover no botão
        validateButton.on('pointerover', () => {
            validateButton.setFillStyle(0x00b0ff);
            document.body.style.cursor = 'pointer';
        });

        validateButton.on('pointerout', () => {
            validateButton.setFillStyle(0x0098db);
            document.body.style.cursor = 'default';
        });

        // Permite submeter com Enter
        input.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                validateButton.emit('pointerdown');
            }
        });

        // Adiciona algumas estrelas no fundo para visual
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.FloatBetween(1, 2.5);
            const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
            
            const star = this.add.rectangle(x, y, size, size, 0x0098db, alpha);
            star.setDepth(-1);
        }
    }
} 