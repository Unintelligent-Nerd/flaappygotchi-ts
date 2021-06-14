import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {

    constructor(config) {
      super('PreloadScene');
  }

    preload() {
        this.load.image('space', 'assets/space.png');
        this.load.spritesheet('gotchi', 'assets/gotchi.png', {
            frameWidth: 633, frameHeight: 621
        })
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('pause', 'assets/pause.png');
        this.load.image('back', 'assets/back.png');

        this.load.audio('music', 'assets/audio/Aavegotchi - 6. Blockchain Boléro.mp3');
        this.load.audio('zap', 'assets/audio/zapsplat_sound_design_electricity_zap_spark_28906.mp3');
    }

    create() {
        this.scene.start('MenuScene');
    }
}

export default PreloadScene;