export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Carregue seus arquivos principais aqui
        this.load.image('player_g', 'src/assets/player_g.png')
        this.load.image('player_r', 'src/assets/player_r.png')
        this.load.image('player_y', 'src/assets/player_y.png')
        this.load.image('player_n', 'src/assets/player_n.png')
        this.load.image('crystal_g', 'src/assets/crystal_g.png')
        this.load.image('crystal_c', 'src/assets/crystal_c.png')
        this.load.image('crystal_r', 'src/assets/crystal_r.png')
        this.load.image('crystal_p', 'src/assets/crystal_p.png')
        this.load.image('crystal_y', 'src/assets/crystal_y.png')
        this.load.image('crystal_n', 'src/assets/crystal_n.png')
        this.load.image('bshoot', 'src/assets/b-shoot.svg')
        this.load.image('bleft', 'src/assets/b-left.svg');
        this.load.image('bright', 'src/assets/b-right.svg');
        
    }

    create() {
        this.scene.start('LauncherScene'); // Muda para a cena principal
    }
}




