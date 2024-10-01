import { Scene } from 'phaser';
import { Slots } from '../scripts/Slots';
import { UiContainer } from '../scripts/UiContainer';
import { LineGenerator } from '../scripts/Lines';
import { UiPopups } from '../scripts/UiPopup';
// import LineSymbols from '../scripts/LineSymbols';
import { 
    Globals, 
    ResultData, 
    currentGameData, 
    initData, 
    gambleResult 
} from '../scripts/Globals';
import { gameConfig } from '../scripts/appconfig';
import SoundManager from '../scripts/SoundManager';

export default class MainScene extends Scene {
    // Declare properties without explicit initialization
    gameBg!: Phaser.GameObjects.Sprite;
    slot!: Slots;
    reelBg!: Phaser.GameObjects.Sprite
    lineGenerator!: LineGenerator;
    soundManager!: SoundManager;
    uiContainer!: UiContainer;
    uiPopups!: UiPopups;    
    // lineSymbols!: LineSymbols;
    private mainContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Container for better organization and potential performance
        this.mainContainer = this.add.container();

        this.soundManager = new SoundManager(this);
        console.log("MainScene Loaded on Miner");

        this.gameBg = this.add.sprite(width / 2, height / 2, 'gameBg')
            .setDepth(0)
            .setDisplaySize(1920, 1080);
        this.reelBg = this.add.sprite(width/2, height/2.2, "reelBg");
        const lightingLamp = this.add.sprite(width/1.2, height * 0.23, "hangigLamp")

        this.mainContainer.add([this.gameBg, this.reelBg, lightingLamp]);
        this.soundManager.playSound("backgroundMusic");

        this.uiContainer = new UiContainer(this, () => this.onSpinCallBack(), this.soundManager);
        this.mainContainer.add(this.uiContainer);

        this.slot = new Slots(this, this.uiContainer, () => this.onResultCallBack(), this.soundManager);
        this.lineGenerator = new LineGenerator(this, this.slot.slotSymbols[0][0].symbol.height, this.slot.slotSymbols[0][0].symbol.width + 70);
        this.mainContainer.add([this.lineGenerator,  this.slot]);

        this.uiPopups = new UiPopups(this, this.uiContainer, this.soundManager);
        this.mainContainer.add(this.uiPopups);
        // this.lineSymbols = new LineSymbols(this, 10, 12, this.lineGenerator);
        // this.mainContainer.add(this.lineSymbols);
     
    }

    update(time: number, delta: number) {
        this.uiContainer.update();
    }

    private onResultCallBack() {
        this.uiContainer.onSpin(false);
        this.soundManager.stopSound("onSpin"); 
        this.lineGenerator.showLines(ResultData.gameData.linesToEmit);
    }

    private onSpinCallBack() {
        this.soundManager.playSound("onSpin");
        this.slot.moveReel();
        this.lineGenerator.hideLines();
    }

    recievedMessage(msgType: string, msgParams: any) {
        if (msgType === 'ResultData') {
            // Use setTimeout for better performance in this case
            setTimeout(() => {
                this.handleResultData();
            }, 3000); 

            // Stop tween after a delay for visual effect
            setTimeout(() => {
                this.slot.stopTween();
            }, 1000);
        } else if (msgType === 'GambleResult') {
            this.uiContainer.currentWiningText.updateLabelText(gambleResult.gamleResultData.currentWining.toString());
        }
    }

    // Handle ResultData logic separately
    private handleResultData() {
        this.uiContainer.currentWiningText.updateLabelText(ResultData.playerData.currentWining.toString());
        currentGameData.currentBalance = ResultData.playerData.Balance;
        let betValue = (initData.gameData.Bets[currentGameData.currentBetIndex]) * 20;
        let winAmount = ResultData.gameData.WinAmout;
        let jackpot = ResultData.gameData.jackpot
        this.uiContainer.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
        if (winAmount >= 10 * betValue && winAmount < 15 * betValue) {
            // Big Win Popup
            this.showWinPopup(winAmount, 'bigWinPopup')
           } else if (winAmount >= 15 * betValue && winAmount < 20 * betValue) {
               // HugeWinPopup
               this.showWinPopup(winAmount, 'hugeWinPopup')
           } else if (winAmount >= 20 * betValue && winAmount < 25 * betValue) {
               //MegawinPopup
               this.showWinPopup(winAmount, 'megaWinPopup')
           } else if(jackpot > 0) {
              //jackpot Condition
              this.showWinPopup(winAmount, 'jackpotPopup')
           }
    }

    // Function to show win popup
    private showWinPopup(winAmount: number, spriteKey: string) {
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(9)
            .setInteractive();

        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation(); 
        });

        const winBg = this.add.sprite(gameConfig.scale.width/2, gameConfig.scale.height/2, "messagePopup").setDepth(11).setOrigin(0.5).setScale(0.7)
        const winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 275, spriteKey).setDepth(13);
        const winAmountPanel = this.add.sprite(gameConfig.scale.width/2, gameConfig.scale.height/2 , "SoundToggleBg").setDepth(11)
            // winAmountPanel.setPosition()
            winAmountPanel.setOrigin(0.5)
    
            // Create the text object to display win amount
            const winText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '0', {
                font: '45px',
                color: '#FFFFFF'
            }).setDepth(11).setOrigin(0.5);
    
            // Tween to animate the text increment from 0 to winAmount
            this.tweens.addCounter({
                from: 0,
                to: winAmount,
                duration: 1000, // Duration of the animation in milliseconds
                onUpdate: (tween) => {
                    const value = Math.floor(tween.getValue());
                    winText.setText(value.toString());
                },
                onComplete: () => {
                    // Automatically close the popup after a few seconds
                    this.time.delayedCall(4000, () => {
                        inputOverlay.destroy();
                        winBg.destroy();
                        winAmountPanel.destroy();
                        winText.destroy();
                        winSprite.destroy();
                    });
                }
            });

    }

}
