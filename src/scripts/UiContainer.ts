import Phaser from 'phaser';
import { Scene, GameObjects, Types } from 'phaser';
import { Globals, ResultData, currentGameData, initData } from './Globals';
import { TextLabel } from './TextLabel';
import { gameConfig } from './appconfig';
import SoundManager from './SoundManager';
// Define UiContainer as a Phaser Scene class
export class UiContainer extends Phaser.GameObjects.Container {
    SoundManager: SoundManager
    spinBtn!: Phaser.GameObjects.Sprite;
    maxbetBtn!: Phaser.GameObjects.Sprite;
    autoBetBtn!: Phaser.GameObjects.Sprite;
    freeSpinBgImg!: Phaser.GameObjects.Sprite
    fireAnimation: Phaser.GameObjects.Sprite[] = [];
    CurrentBetText!: TextLabel;
    currentWiningText!: TextLabel;
    currentBalanceText!: TextLabel;
    CurrentLineText!: TextLabel;
    freeSpinText!: TextLabel;
    pBtn!: Phaser.GameObjects.Sprite;
    mBtn!: Phaser.GameObjects.Sprite
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    mainScene!: Phaser.Scene
    fireSprite1!: Phaser.GameObjects.Sprite
    fireSprite2!: Phaser.GameObjects.Sprite
    betButtonDisable!: Phaser.GameObjects.Container
    freeSpinContainer!: Phaser.GameObjects.Container
    spinButtonSound!: Phaser.Sound.BaseSound
    normalButtonSound!: Phaser.Sound.BaseSound

    constructor(scene: Scene, spinCallBack: () => void, soundManager: SoundManager) {
        super(scene);
        scene.add.existing(this); 
        // Initialize UI elements
        this.maxBetInit();
        this.spinBtnInit(spinCallBack);
        this.autoSpinBtnInit(spinCallBack);
        this.lineBtnInit();
        this.winBtnInit();
        this.balanceBtnInit();
        this.BetBtnInit();
        this.numberofLines();
        this.SoundManager = soundManager;
        // this.freeSpininit();
        // this.vaseInit();
    }

     /**
     * @method maxBetBtn used to increase the bet amount to maximum
     * @description this method is used to add a spirte button and the button will be used to increase the betamount to maximun example on this we have twenty lines and max bet is 1 so the max bet value will be 1X20 = 20
     */
     maxBetInit() {
        this.maxbetBtn =  new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'maxBetBtn');
        this.maxbetBtn = this.createButton('maxBetBtn', gameConfig.scale.width * 0.6, gameConfig.scale.height * 0.9, () => {
            if (this.SoundManager) {
                this.bnuttonMusic("buttonpressed");
            }
            this.scene.tweens.add({
                targets: this.maxbetBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                onComplete: ()=>{
                    this.maxbetBtn.setTexture("maxBetBtOnPressed")
                    this.maxbetBtn.disableInteractive()
                    currentGameData.currentBetIndex = initData.gameData.Bets.length - 1;
                    this.CurrentBetText.updateLabelText((currentGameData.currentBetIndex*initData.gameData.Lines.length).toString());
                    this.CurrentLineText.updateLabelText(initData.gameData.Bets[initData.gameData.Bets.length - 1]);
                    this.scene.tweens.add({
                        targets: this.maxbetBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: ()=>{
                            this.maxbetBtn.setTexture("maxBetBtn");
                            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true })
                        }
                    })
                    
                }
            })
        
        }).setDepth(0).setScale(0.9);      
    }


    /**
     * @method lineBtnInit Shows the number of lines for example 1 to 20
     */
    lineBtnInit() { 
        const container = this.scene.add.container(gameConfig.scale.width * 0.29, this.maxbetBtn.y);
        // const lineText = new TextLabel(this.scene, -20, -70, "LINES", 30, "#3C2625");
        const linePanel = this.scene.add.sprite(0, 0, "lineBetNew").setDepth(0).setScale(0.9);
        linePanel.setOrigin(0.5);
        linePanel.setPosition(gameConfig.scale.width * 0.29, this.maxbetBtn.y);
        // container.add(lineText);
        this.pBtn = this.createButton('pBtn', 142, -3, () => {
            this.bnuttonMusic("buttonpressed");
            this.pBtn.setTexture('pBtnH');
            this.pBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex++;
                // console.log(currentGameData.currentBetIndex, "currentGameData.currentBetIndex");
                
                if (currentGameData.currentBetIndex >= initData.gameData.Bets.length) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * initData.gameData.Lines.length;
                this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.pBtn.setTexture('pBtn');
                this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(0);
        container.add(this.pBtn);
        this.mBtn = this.createButton('mBtn', -142, -3, () => {
            this.bnuttonMusic("buttonpressed");
            this.mBtn.setTexture('mBtnH');
            this.mBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex++;
                if (currentGameData.currentBetIndex >= initData.gameData.Bets.length) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * initData.gameData.Lines.length;
                this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.mBtn.setTexture('mBtn');
                this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(0);
        container.add(this.mBtn);
        const lineBetText = this.scene.add.text(-50, -3, "LINE BET", {color:"#e9d748", fontSize:"45px", fontFamily:"BabasKai"}).setOrigin(0.5)
        this.CurrentLineText = new TextLabel(this.scene, 60, -3, initData.gameData.Bets[currentGameData.currentBetIndex], 37, "#ffffff").setOrigin(0.5);
        //Line Count
        
        container.add([lineBetText, this.CurrentLineText]).setDepth(1)
    }

    /**
     * @method winBtnInit add sprite and text
     * @description add the sprite/Placeholder and text for winning amount 
     */
    winBtnInit() {
        const winPanel = this.scene.add.sprite(0, 0, 'lines').setScale(0.9);
        winPanel.setOrigin(0.5);
        // winPanel.setScale(0.8, 0.8)
        winPanel.setPosition(gameConfig.scale.width * 0.6,  gameConfig.scale.height * 0.07);
        const currentWining: any = ResultData.playerData.currentWining;
       
        this.currentWiningText = new TextLabel(this.scene, 0, -3, currentWining, 37, "#ffffff").setOrigin(0.5);
        const winHeading = this.scene.add.text(-100, -3, "WIN", {color:"#e9d748", fontSize:"45px", fontFamily:"BabasKai"}).setOrigin(0.5)
        const winPanelChild = this.scene.add.container(winPanel.x, winPanel.y)
        winPanelChild.add([winHeading, this.currentWiningText]);
        if(currentWining > 0){
            console.log(currentWining, "currentWining");
            this.scene.tweens.add({
                targets:  this.currentWiningText,
                scaleX: 1.3, 
                scaleY: 1.3, 
                duration: 800, // Duration of the scale effect
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' // Easing function
            });
        }
    }
    /**
     * @method balanceBtnInit Remaning balance after bet (total)
     * @description added the sprite/placeholder and Text for Total Balance 
     */
    balanceBtnInit() {
        const balancePanel = this.scene.add.sprite(0, 0, 'lines').setScale(0.9);
        balancePanel.setOrigin(0.5);
        balancePanel.setPosition(gameConfig.scale.width * 0.35, gameConfig.scale.height * 0.07);
        const container = this.scene.add.container(balancePanel.x, balancePanel.y);
        // container.add(balancePanel);
        currentGameData.currentBalance = initData.playerData.Balance;
        this.currentBalanceText = new TextLabel(this.scene, 60, -3, currentGameData.currentBalance.toFixed(2), 37, "#ffffff").setOrigin(0.5);
        const balance = this.scene.add.text(-70, -3, "BALANCE", {color: "#e9d748", fontSize:"45px", fontFamily:"BabasKai"}).setOrigin(0.5)
        container.add([balance, this.currentBalanceText]);
    }
/**
     * @method spinBtnInit Spin the reel
     * @description this method is used for creating and spin button and on button click the a SPIn emit will be triggered to socket and will deduct the amout according to the bet
     */
    spinBtnInit(spinCallBack: () => void) {
        
        this.spinBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "spinBtn");
        this.spinBtn = this.createButton('spinBtn', gameConfig.scale.width * 0.88, gameConfig.scale.height - this.spinBtn.height/1.35, () => {
                this.bnuttonMusic("spinButton");
            // checking if autoSpining is working or not if it is auto Spining then stop it
            if(this.isAutoSpinning){
                this.autoBetBtn.emit('pointerdown'); // Simulate the pointerdown event
                this.autoBetBtn.emit('pointerup'); // Simulate the pointerup event (if needed)
                return;
            }
        // tween added to scale transition
            this.scene.tweens.add({
                targets: this.spinBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                onComplete: () => {
                    // Send message and update the balance
                    Globals.Socket?.sendMessage("SPIN", { currentBet: currentGameData.currentBetIndex, currentLines: initData.gameData.Lines.length, spins: 1 });
                    currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    // Trigger the spin callback
                    this.onSpin(true);
                    spinCallBack();

                    // Scale back to original size 
                    this.scene.tweens.add({
                        targets: this.spinBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: () => {
                            
                        }
                    });
                    // 
                }
            });
        }).setDepth(1);

    }

    numberofLines(){
        const container = this.scene.add.container(gameConfig.scale.width * 0.12, this.maxbetBtn.y);
        const numlinePanel = this.scene.add.sprite(0, 0, "BetPanel").setDepth(4).setScale(0.9);
        const totalNumLines = new TextLabel(this.scene, 30, -3, "40", 37, "#ffffff").setOrigin(0.5)
        const LinesText = this.scene.add.text(-40, -3, "LINES", {color:"#e9d748", fontFamily:"BabasKai", fontSize:"45px"}).setOrigin(0.5)
        //Line Count
        container.add([numlinePanel, LinesText, totalNumLines]).setDepth(1)    
    }


    /**
     * @method autoSpinBtnInit 
     * @param spinCallBack 
     * @description crete and auto spin button and on that spin button click it change the sprite and called a recursive function and update the balance accroding to that
     */
    autoSpinBtnInit(spinCallBack: () => void) {
        this.autoBetBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "autoSpin");
        this.autoBetBtn = this.createButton(
            'autoSpin',
            gameConfig.scale.width * 0.74,
            gameConfig.scale.height * 0.9,
            () => {
                this.normalButtonSound = this.scene.sound.add("buttonpressed", {
                    loop: false,
                    volume: 0.8
                })
                this.normalButtonSound.play()
                this.scene.tweens.add({
                    targets: this.autoBetBtn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    onComplete: () =>{
                        this.isAutoSpinning = !this.isAutoSpinning; // Toggle auto-spin state
                        if (this.isAutoSpinning && currentGameData.currentBalance > 0) {
                            Globals.Socket?.sendMessage("SPIN", {
                                currentBet: currentGameData.currentBetIndex,
                                currentLines : initData.gameData.Lines.length
                            });
                            currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                            this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                            this.autoSpinRec(true)
                            spinCallBack(); // Callback to indicate the spin has started
                            // Start the spin recursion
                            this.startSpinRecursion(spinCallBack);
                        } else {
                            // Stop the spin if auto-spin is turned off
                            this.autoSpinRec(false);
                        }
                        this.scene.tweens.add({
                            targets: this.autoBetBtn,
                            scaleX: 1,
                            scaleY: 1,
                            duration: 100,
                            onComplete: () => {
                                // this.spinBtn.setTexture('spinBtn');
                            }
                        });
                    }
                })
            }
        ).setDepth(0).setScale(0.9);
    }
   
    
    /**
     * @method BetBtnInit 
     * @description this method is used to create the bet Button which will show the totla bet which is placed and also the plus and minus button to increase and decrese the bet value
     */
    BetBtnInit() {
        const container = this.scene.add.container(gameConfig.scale.width * 0.46, this.maxbetBtn.y);
        this.betButtonDisable = container    
        const betPanel = this.scene.add.sprite(0, 0, 'BetPanel').setOrigin(0.5).setDepth(4).setScale(0.9);
        container.add(betPanel);
        const totalBetHeading = this.scene.add.text(-40, 0, "TOTAL\n BET", {color:"#e9d748", fontFamily:"BabasKai", fontSize:"36px"}).setOrigin(0.5)
        this.CurrentBetText = new TextLabel(this.scene, 50, 0, ((initData.gameData.Bets[currentGameData.currentBetIndex]) * initData.gameData.Lines.length).toString(), 37, "#ffffff").setDepth(6);
        container.add([totalBetHeading, this.CurrentBetText]);
    }

    /**
     * @method freeSpininit 
     * @description this method is used for showing the number of freeSpin value at the top of reels
     */
    freeSpininit(freeSpinNumber: number){
        if(freeSpinNumber == 0){
            if(this.freeSpinBgImg){
                this.freeSpinBgImg.destroy();
                this.freeSpinText.destroy()
                this.freeSpinContainer.destroy();
            }   
        }
        if(freeSpinNumber >= 1){
            // this.freeSpinContainer = this.scene.add.container(gameConfig.scale.width/2, gameConfig.scale.height*0.15);
            // const freeSpinBg = this.scene.add.sprite(this.freeSpinContainer.x, this.freeSpinContainer.y, "").setScale(0.8, 0.5);
            // const freeSpinCount = new TextLabel(this.scene, freeSpinBg.x - 20, freeSpinBg.y - 5, "Free Spin : ", 27, "#ffffff");
            // this.freeSpinText = new TextLabel(this.scene, freeSpinBg.x + 55, freeSpinBg.y - 5, freeSpinNumber.toString(), 27, "#ffffff")
            // this.freeSpinBgImg = freeSpinBg
        }else{
           
        }
    }
    /**
     * @method startSpinRecursion
     * @param spinCallBack 
     */
    startSpinRecursion(spinCallBack: () => void) {
        if (this.isAutoSpinning && currentGameData.currentBalance > 0) {
            // this.startFireAnimation();
            // Delay before the next spin
            const delay = currentGameData.isMoving && (ResultData.gameData.symbolsToEmit.length > 0) ? 3000 : 5000;
            this.scene.time.delayedCall(delay, () => {
                if (this.isAutoSpinning && currentGameData.currentBalance >= 0) {
                    Globals.Socket?.sendMessage("SPIN", {
                        currentBet: currentGameData.currentBetIndex,
                        currentLines : initData.gameData.Lines.length
                    });
                    currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    spinCallBack();
                    // Call the spin recursively
                    this.spinRecursively(spinCallBack);
                }
            });
        }
    }

    spinRecursively(spinCallBack: () => void) {
        if (this.isAutoSpinning) {
            // Perform the spin
            this.autoSpinRec(true);
            if (currentGameData.currentBalance < initData.gameData.Bets[currentGameData.currentBetIndex]) {
                // Stop the spin when a winning condition is met or balance is insufficient
                this.autoSpinRec(false);
                spinCallBack();
            } else {
                // Continue spinning if no winning condition is met and balance is sufficient
                this.startSpinRecursion(spinCallBack);
            }
        }
    }
    
    createButton(key: string, x: number, y: number, callback: () => void): Phaser.GameObjects.Sprite {
        const button = this.scene.add.sprite(x, y, key).setInteractive({ useHandCursor: true, pixelPerfect: true });
        button.on('pointerdown', callback);
        return button;
    }
   
    autoSpinRec(spin: boolean){
        if(spin){
            this.spinBtn.setTexture("spinBtnOnPressed");
            this.autoBetBtn.setTexture("autoSpinOnPressed");
            this.maxbetBtn.disableInteractive();
            this.pBtn.disableInteractive();
            this.mBtn.disableInteractive();
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.autoBetBtn.setTexture("autoSpin");
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
        }        
    }

    onSpin(spin: boolean) {
        // Handle spin functionality
        if(this.isAutoSpinning){
            return
        }
        if(spin){
            this.spinBtn.disableInteractive();
            this.spinBtn.setTexture("spinBtnOnPressed");
            this.autoBetBtn.setTexture("autoSpinOnPressed");
            this.autoBetBtn.disableInteractive();
            this.maxbetBtn.disableInteractive();
            this.pBtn.disableInteractive();
            this.mBtn.disableInteractive();
            
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.spinBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.autoBetBtn.setTexture("autoSpin");
            this.autoBetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
        }        
    }

    bnuttonMusic(key: string){
        this.SoundManager.playSound(key)
    }
    update(){
        // console.log("check container");
        
    }
}
