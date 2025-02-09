export default class Cpu extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type) {
        // Seleciona o sprite correto baseado no tipo
        let spriteKey;
        if (type.startsWith('point1')) {
            spriteKey = 'crystal_g';
        } else if (type.startsWith('point2')) {
            spriteKey = 'crystal_g'; 
        } else if (type.startsWith('point3')) {
            spriteKey = 'crystal_c'; 
        } else if (type.startsWith('debit1')) {
            spriteKey = 'crystal_r';
        }  else if (type.startsWith('debit2')) {
            spriteKey = 'crystal_r'; 
        }  else if (type.startsWith('debit3')) {
            spriteKey = 'crystal_p'; 
        } else if (type.startsWith('joker')) {
            spriteKey = 'crystal_y';
        }

        super(scene, x, y, spriteKey);
        this.type = type;
        this.active = true;

        /*
        // Configurações específicas baseadas no tipo
        switch(type) {
            case 'point1':
                this.setTint(0x0000ff); // Azul
                break;
            case 'point2':
                this.setTint(0x0000ff); // Azul
                break;
            case 'point3':
                this.setTint(0x00ffff); // Ciano
                break;
            case 'debit1':
                this.setTint(0xff0000); // Vermelho
                break;
            case 'debit2':
                this.setTint(0xff0000); // Vermelho 
                break;
            case 'debit3':
                this.setTint(0xfc0fc0); // Rosa
                break;
            case 'joker_inverse':
                this.setTint(0xffff00); // Amarelo
                break;
            case 'joker_wonderguard':
                this.setTint(0xffff00); // Amarelo
                break;
            case 'joker_freeze':
                this.setTint(0xffff00); // Amarelo
                break;
        }
        */

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setVelocityY(200);
        this.setScale(0.5);

        // Guarda referência da cena
        this.gameScene = scene;
        
        // Verifica a posição a cada frame
        this.scene.events.on('update', this.checkPosition, this);
    }

    checkPosition() {
        // Verifica se o objeto ainda está ativo antes de fazer qualquer operação
        if (!this.active) return;
        
        try {
            if (this.gameScene && this.gameScene.cameras && this.y > this.gameScene.cameras.main.height) {
                this.destroy();
            }
        } catch (error) {
            console.error('Erro ao verificar posição:', error);
        }
    }

    destroy() {
        // Marca como inativo antes de destruir
        this.active = false;
        
        // Remove o evento de update
        if (this.scene) {
            this.scene.events.off('update', this.checkPosition, this);
        }
        
        super.destroy();
    }

    onDestroy(scene) {
        if (!scene) return;
        
        try {
            const isOnScreen = scene.cameras.main.worldView.contains(this.x, this.y);
            switch(this.type) {
                case 'point1':
                    // Criar explosão que afeta área maior
                    break;
                case 'point2':
                    // Dar pontos extras ou power-up
                    break;
                default:
                    // Comportamento normal de destruição
                    break;
            }
        } catch (error) {
            console.error('Erro no onDestroy:', error);
        }
    }
}
