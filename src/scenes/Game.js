import { Scene } from 'phaser';

let player;
let ground;
let clouds;

const WIDTH = 1024;
const HEIGHT = 768;

export class Game extends Scene {
    constructor() {
        super('Game');
        this.player = null;
    }
   

    preload() {
        this.load.image("game-over","assets/game-over.png");
        this.load.image("restart","assets/restart.png");
        this.load.spritesheet("dino", "assets/dino-idle.png", {frameWidth: 88, frameHeight:94});
        this.load.spritesheet("dino-run", "assets/dino-run.png", {frameWidth: 88, frameHeight:94});
        this.load.image("dino-hurt","assets/dino-hurt.png");
        this.load.image("ground","assets/ground.png");
        this.load.image("cloud","assets/cloud.png");
        this.load.audio("jump","assets/jump.m4a");
        this.load.audio("hit","assets/hit.m4a");

        for(let i=0; i<6; i++){
            const cactusNum = i + 1;
            this.load.image(`obstacle-${cactusNum}`,`assets/cactuses_${cactusNum}.png`);
        }

    }

    create() {
        this.score = 0;
        this.frameCounter = 0;
        this.isGameRunning = true;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.timer = 0;
        for(let i = 0; i<100; i++){
            const cactusNum = i+1;
            console.log(`cactus${cactusNum}`)
        }
        this.ground = this.add.tileSprite(0, 300, WIDTH, 30, "ground")
            .setOrigin(0, 1);
        this.groundCollider = this.physics.add.staticSprite(0, 300, '')
            .setOrigin(0, 1);
        this.groundCollider.body.setSize(WIDTH, 30);
        this.player = this.physics.add.sprite(200, 200, "dino-run")
            .setDepth(1)
            .setOrigin(0, 1)
            .setGravityY(5000)
            .setCollideWorldBounds(true)
            .setBodySize(44, 92);
        this.physics.add.collider(this.player, this.groundCollider);
        this.clouds = this.add.group();
        this.clouds = this.clouds.addMultiple([
            this.add.image(200, 100, "cloud"),
            this.add.image(300, 130, "cloud"),
            this.add.image(450, 80, "cloud"),
        ]);
        this.gameSpeed = 10;
        this.obstacles = this.physics.add.group({
            allowGravity : false
        });
        this.physics.add.collider(this.player, this.obstacles, this.gameOver, null, this);
        this.gameOverText=this.add.image(0,0,"game-over");
        this.restartText = this.add.image(0,80,"restart").setInteractive();
        this.gameOverContainer = this.add
        .container(1000/2,(300/2)-50)
        .add([this.gameOverText,this.restartText])
        .setAlpha(0);
        this.scoreText = this.add.text(700,50,"00000",{
            fontSize: 30,
            fontFamily:"Arial",
            color:"#535353",
            resolution:5
        }).setOrigin(1,0);
        this.highScore = 0;
        this.highScoreText = this.add.text(700, 0, "High: 00000",{
            fontSize: 30,
            fontFamily: "Arial",
            color: "#535353",
            resolution: 5
        }).setOrigin(1,0).setAlpha(1);
        this.congratsText = this.add.text(0, 0, "Congratulations! A new high score!",{
            fontSize: 30,
            fontFamily: "Arial",
            color: "#535353",
            resolution: 5
        }).setOrigin(0).setAlpha(1);
    }

    update(time,delta) {
        if(!this.isGameRunning){return;}
        this.ground.tilePositionX += this.gameSpeed;
        this.timer+=delta;
        console.log(this.timer);
        if(this.timer>1000){
            this.obstacleNum = Math.floor(Math.random()*6)+1;
            this.obstacles.create(750,220,`obstacle-${this.obstacleNum}`).setOrigin(0);
            this.timer -=1000;
        }
        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
        const{space,up}=this.cursors;
        if (
            (Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up))
            && this.player.body.onFloor()
          ) {
            this.player.setVelocityY(-1600);
            this.sound.play("jump");
          }
          this.restartText.on("pointerdown",()=>{
            this.physics.resume();
            this.player.setVelocity(0);
            this.obstacles.clear(true,true);
            this.gameOverContainer.setAlpha(0);
            this.congratsText.setAlpha(0);
            this.frameCounter = 0;
            this.score = 0;
            const formattedScore = String(Math.floor(this.score)).padStart(5,"0");
            this.scoreText.setText(formattedScore);
            this.isGameRunning = true;
            this.anims.resumeAll();
          })
          this.frameCounter++;
          if(this.frameCounter > 100){
            this.score += 100;
            const formattedScore = String(Math.floor(this.score));
            this.scoreText.setText(formattedScore);
            this.frameCounter -= 100;
          }

          this.anims.create({
            key: "dino-run",
            frames: this.anims.generateFrameNumbers("dino-run", { start: 2, end: 4 }),
            frameRate: 10,
            repeat: -1
          });
          if (this.player.body.deltaAbsY()>4){
            this.player.anims.stop();
            this.player.setTexture("dino",0);
          }else{
            this.player.play("dino-run",true);
            }
          
    }


    gameOver(){
        if(this.score > this.highScore){
            this.highScore = this.score;
            this.highScoreText.setText("High: " + String(this.highScore).padStart(5,"0"));
            this.congratsText.setAlpha(1);
        }
        this.physics.pause();
        this.timer=0;
        this.isGameRunning=false;
        this.gameOverContainer.setAlpha(1);
        this.anims.pauseAll();
        this.player.setTexture("dino-hurt");
        this.sound.play("hit");
    }
}

