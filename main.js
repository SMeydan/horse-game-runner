class BootScene extends Phaser.Scene {
    constructor() {
      super('Boot');
    }
  
    preload() {
      this.load.image('bg', 'assets/bg.png');
      this.load.image('ground', 'assets/ground.png');
      this.load.image('obstacle', 'assets/obstacle.png');
      this.load.image('coin', 'assets/coin.png');
      this.load.image('startBtn', 'assets/start.png');
      this.load.image('restartBtn', 'assets/restart.png');
      this.load.image('horse1', 'assets/horse1.png');
      this.load.image('horse2', 'assets/horse2.png');
  
      this.load.on('complete', () => {
        this.scene.start('UI');
      });
    }
  }
  
  class UIScene extends Phaser.Scene {
    constructor() {
      super('UI');
    }
  
    create() {
      this.add.image(400, 200, 'bg').setAlpha(0.6);
      this.add.text(260, 100, '🐎 ATBOT RUNNER', { fontSize: '32px', fill: '#fff' });
  
      const btn = this.add.image(400, 200, 'startBtn').setInteractive().setScale(0.5);
      btn.on('pointerdown', () => this.scene.start('Game'));
  
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
  
    update() {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.scene.start('Game');
      }
    }
  }
  
  class GameScene extends Phaser.Scene {
    constructor() {
      super('Game');
    }
  
    create() {
      this.score = 0;
      this.lives = 3;
  
      this.bg = this.add.tileSprite(400, 200, 800, 400, 'bg');
      this.ground = this.add.tileSprite(400, 360, 800, 100, 'ground');
  
      this.anims.create({
        key: 'run',
        frames: [{ key: 'horse1' }, { key: 'horse2' }],
        frameRate: 4,
        repeat: -1
      });
  
      this.player = new Player(this, 100, 300);
  
      this.obstacles = this.physics.add.group();
      this.coins = this.physics.add.group();
  
      this.cursors = this.input.keyboard.createCursorKeys();
      this.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  
      this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '18px', fill: '#fff' });
      this.livesText = this.add.text(700, 16, '❤️ x3', { fontSize: '18px', fill: '#fff' });
  
      this.physics.add.collider(this.player.sprite, this.obstacles, this.hitObstacle, null, this);
      this.physics.add.overlap(this.player.sprite, this.coins, this.collectCoin, null, this);
  
      this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: this.spawnObstacle,
        callbackScope: this
      });
  
      this.time.addEvent({
        delay: 3000,
        loop: true,
        callback: this.spawnCoin,
        callbackScope: this
      });
    }
  
    update() {
      const isRunningFast = this.shiftKey.isDown;
      const bgSpeed = isRunningFast ? 5 : 2;
      const groundSpeed = isRunningFast ? 10 : 6;
  
      this.bg.tilePositionX += bgSpeed;
      this.ground.tilePositionX += groundSpeed;
  
      // Zıplama (Space, W, Up)
      if (
        (this.cursors.up.isDown || this.W.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey(32))) &&
        this.player.canJump()
      ) {
        this.player.jump();
      }
  
      // Restart (R)
      if (this.lives <= 0 && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
    }
  
    spawnObstacle() {
      const obs = this.obstacles.create(800, 330, 'obstacle').setScale(0.2);
      obs.setVelocityX(-300);
      obs.setImmovable();
      obs.body.allowGravity = false;
    }
  
    spawnCoin() {
      const coin = this.coins.create(800, Phaser.Math.Between(200, 280), 'coin').setScale(0.5);
      coin.setVelocityX(-200);
      coin.body.allowGravity = false;
    }
  
    collectCoin(player, coin) {
      coin.destroy();
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
    }
  
    hitObstacle(player, obstacle) {
      obstacle.destroy();
      this.lives -= 1;
      this.livesText.setText('❤️ x' + this.lives);
  
      if (this.lives <= 0) {
        this.physics.pause();
        this.player.sprite.anims.stop();
  
        const btn = this.add.image(400, 200, 'restartBtn').setInteractive().setScale(0.5);
        btn.on('pointerdown', () => this.scene.restart());
      }
    }
  }
  
  class Player {
    constructor(scene, x, y) {
      this.scene = scene;
      this.sprite = scene.physics.add.sprite(x, y, 'horse1').setScale(0.6);
      this.sprite.setCollideWorldBounds(true);
      this.sprite.anims.play('run', true);
      this.jumpCount = 0;
      this.maxJumps = 2; // çift zıplama
    }
  
    jump() {
      if (this.jumpCount < this.maxJumps) {
        this.sprite.setVelocityY(-500);
        this.jumpCount++;
      }
    }
  
    canJump() {
      if (this.sprite.body.touching.down) {
        this.jumpCount = 0; // yere değdiğinde resetle
      }
      return this.jumpCount < this.maxJumps;
    }
  }
  
  // Oyun Konfigürasyonu
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1000 },
        debug: false
      }
    },
    scene: [BootScene, UIScene, GameScene]
  };
  
  const game = new Phaser.Game(config);
  