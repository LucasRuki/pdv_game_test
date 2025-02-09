export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Carregue qualquer arquivo necessário para a inicialização
        
    }

    create() {
        this.scene.start('PreloadScene'); // Muda para a cena de preload
    }
}
