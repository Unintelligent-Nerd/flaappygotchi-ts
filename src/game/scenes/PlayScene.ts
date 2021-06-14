import BaseScene from './BaseScene';

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {

  constructor(config) {
    super('PlayScene', config);

    this.gotchi = null;
    this.pipes = null;
    this.isPaused = false;

    this.pipeHorizontalDistance = 0;
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = '';

    this.currentDifficulty = 'easy';
    this.difficulties = {
      'easy': {
        pipeHorizontalDistanceRange: [300, 350],
        pipeVerticalDistanceRange: [150, 200]
      },
      'normal': {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticalDistanceRange: [140, 190]
      },
      'hard': {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticalDistanceRange: [120, 170]
      },
    }
  }

  create() {
    this.currentDifficulty = 'easy';
    super.create();
    this.createGotchi();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();

    this.music.play();

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('gotchi', { start: 0, end: 1}),
      // 24 fps default, it will play animations consisting of 24 frames in 1 second
      // in case of framerate 2 and sprite of 8 frames animations will play in 
      // 4 sec; 8 / 2 = 4
      frameRate: 2,
      // repeat infinitely
      repeat: -1
    })

    this.gotchi.play('fly');
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
    if (this.pauseEvent) { return; }
    
    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in: ' + this.initialTime, this.fontOptions).setOrigin(0.5)
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true
      }),
      this.music.play();
    })
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createBG() {
    this.add.image(0, 0, 'space').setOrigin(0, 0);
  }

  createGotchi() {
    this.gotchi = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'gotchi')
      .setScale(0.1)
      .setOrigin(0);

    this.gotchi.setBodySize(this.gotchi.width - 100, this.gotchi.height - 100);
    this.gotchi.body.gravity.y = 600;
    this.gotchi.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group()

    for (let i = 0; i < PIPES_TO_RENDER; i++) {   
      const upperPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);
  
      this.placePipe(upperPipe, lowerPipe)
    }
  
    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.gotchi, this.pipes, () => {
      this.zap.play(),
      this.gameOver()
    }
    , null, this);
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#FFFF00'});
    this.add.text(16, 52, `Best Score ${bestScore || 0}`, { fontSize: '18px', fill: '#FFFF00'})
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setOrigin(1, 1)
      .setScale(3);

      pauseButton.on('pointerdown', () => {
        this.isPaused = true;
        this.physics.pause();
        this.scene.pause();
        this.music.stop();
        this.scene.launch('PauseScene');
      })
  }

  handleInputs() {
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }

  checkGameStatus() {
    if (this.gotchi.getBounds().bottom >= this.config.height || this.gotchi.y <= 0) {
        this.gameOver();
      }
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeVerticalDistance);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);
  
    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;
  
    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }
    
  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach(pipe => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    })
  }

  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDifficulty = 'normal';
    }

    if (this.score === 3) {
      this.currentDifficulty = 'hard';
    }
  }

  getRightMostPipe() {
    let rightMostX = 0;
  
    this.pipes.getChildren().forEach(function(pipe) {
        rightMostX = Math.max(pipe.x, rightMostX);
      })
  
      return rightMostX;
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
    }
  }
    
  gameOver() {
    this.physics.pause();
    this.gotchi.setTint(0xEE4824);
    this.music.stop();
    
    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false
    })
  }
    
  flap() {
    if (this.isPaused) { return; }
    this.gotchi.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;