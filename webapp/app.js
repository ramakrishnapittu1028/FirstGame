(function(){
    'use strict';

    var vm = window;
    vm.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    var game = new Phaser.Game(config);

    var score = 0;
    var scoreText;
    var platforms, player, stars, bombs, cursors, gameOver, replayText;

    function preload() {
      this.load.image('sky', 'assets/sky.png');
      this.load.image('ground', 'assets/platform.png');
      this.load.image('star', 'assets/star.png');
      this.load.image('bomb', 'assets/bomb.png');
      this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
      );
    }

    function create() {
      window.globalPhysics = this.physics;
      this.add.image(400, 300, 'sky');

      createPlatforms(this.physics);      

      createPlayer(this.physics, this.anims);
      this.physics.add.collider(player, platforms);

      createStars(this.physics);
      this.physics.add.collider(stars, platforms);
      this.physics.add.overlap(player, stars, collectStar, null, this);

      scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
      bombs = this.physics.add.group();
      
      this.physics.add.collider(bombs, platforms);
      this.physics.add.collider(player, bombs, hitBomb, null, this);

      upgradeLevel();

    }

    function createPlatforms(physics){
      platforms = physics.add.staticGroup();

      platforms.create(400, 568, 'ground').setScale(2).refreshBody();

      platforms.create(600, 400, 'ground');
      platforms.create(50, 250, 'ground');
      platforms.create(750, 220, 'ground');
    }

    function createStars(physics){
      stars = physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
      });

      stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });
    }

    function createPlayer(physics, anims){
      player = physics.add.sprite(100, 450, 'dude');

      player.setBounce(0.2);
      player.setCollideWorldBounds(true);

      anims.create({
        key: 'left',
        frames: anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });

      anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
      });

      anims.create({
        key: 'right',
        frames: anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
      });
      return player;
    }

    function replayClicked(pointer, b, c, camera){
      resetGame();
      this.destroy();
    }

    function update() {
      cursors = this.input.keyboard.createCursorKeys();

      if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
      }
      else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
      }
      else {
        player.setVelocityX(0);

        player.anims.play('turn');
      }

      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
      }
    }

    function collectStar(player, star) {
      star.disableBody(true, true);

      score += 10;
      scoreText.setText('Score: ' + score);

      if (stars.countActive(true) === 0) {
        
        upgradeLevel();
      }
    }

    function upgradeLevel(){
      stars.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    function hitBomb(player, bomb) {
      this.physics.pause();

      player.setTint(0xff0000);
      player.anims.play('turn');

      gameOver = true;
      showReplayButton(this);
    }

    function showReplayButton(context){
      replayText = context.add.text(350, 300, 'REPLAY', { fontSize: '32px', fill: '#000' });
      replayText.setInteractive();
      replayText.on('pointerdown', replayClicked);
    }

    function resetGame(){
      score = 0;
      scoreText.setText('Score: ' + score);
      upgradeLevel();

      player.setTint();
      bombs.children.entries.forEach(function(bomb){
        bomb.disableBody(true, true);
      });
      window.globalPhysics.resume();
    }

}());
