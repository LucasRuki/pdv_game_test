import BootScene from './src/scenes/bootScene.js';
import PreloadScene from './src/scenes/preloadScene.js';
import MainScene from './src/scenes/mainScene.js';
import GameScene from './src/scenes/gameScene.js';
import LauncherScene from './src/scenes/launcherScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#201533',
    parent: 'game',
    scene: [BootScene, PreloadScene, MainScene, LauncherScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    }
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});

