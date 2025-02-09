export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_g');
        
        // Adiciona o sprite na cena e ativa a física
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configuração da física do player
        this.body.setCollideWorldBounds(true);
        
        // Ajusta o tamanho do sprite
        this.setScale(0.5);

        // Torna o sprite interativo e arrastável
        this.setInteractive({ draggable: true });
        
    }

}
