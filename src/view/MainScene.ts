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
    emptyBar!: Phaser.GameObjects.Sprite;
    // lineSymbols!: LineSymbols;
    private mainContainer!: Phaser.GameObjects.Container;
    private inputOverLay!: Phaser.GameObjects.Shape
    private inputContainer!: Phaser.GameObjects.Container

    private freeSpinElements: {
        freeText: Phaser.GameObjects.Text;
        filledBar: Phaser.GameObjects.Sprite;
        maskGraphics: Phaser.GameObjects.Graphics;
        initialCount: number;
        maxFreeSpins: number;
        currentCount: number;
    } | null = null;

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Container for better organization and potential performance
        this.mainContainer = this.add.container();

        this.soundManager = new SoundManager(this);

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
        let jackpot = ResultData.gameData.jackpot;
        const freeSpinCount = ResultData.gameData.freeSpins.count;
        // const freeSpinCount = 5;
        const maxFreeSpins = 5
                // Check if freeSpinCount is greater than 1
        if (freeSpinCount >=1) {
                this.freeSpinPopup(freeSpinCount, maxFreeSpins, 'freeSpinEmptyBar')
                // this.uiContainer.freeSpininit(freeSpinCount)
        } else {
            this.uiContainer.freeSpininit(freeSpinCount)
        }
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
     /**
     * @method freeSpinPopup
     * @description Displays a popup showing the win amount with an increment animation and different sprites
     * @param freeSpinCount The amount won to display in the popup
     * @param spriteKey The key of the sprite to display in the popup
     */
    freeSpinPopup(freeSpinCount: number, maxFreeSpins: number, spriteKey: string) {
        // Create the popup background
        if (!this.inputOverLay) {
            this.inputOverLay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2a1820, 0)
                .setOrigin(0, 0)
                .setDepth(9)
                .setInteractive();
            this.inputOverLay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                pointer.event.stopPropagation();
            });
        }
    
        // Create or update the empty bar sprite
        if (!this.emptyBar) {
            this.emptyBar = this.add.sprite(this.cameras.main.width * 0.1, this.cameras.main.centerY, 'freeSpinEmptyBar').setDepth(11);
        }
        // Create the filled bar sprite
        // Create or update the filled bar sprite
        let filledBar: Phaser.GameObjects.Sprite;
        if (this.freeSpinElements && this.freeSpinElements.filledBar) {
            filledBar = this.freeSpinElements.filledBar;
        } else {
            filledBar = this.add.sprite(this.cameras.main.width * 0.1, this.cameras.main.centerY, 'freeSpinFilledBar').setDepth(12);
        }

        // Create or update the mask for the filled bar
        let maskGraphics: Phaser.GameObjects.Graphics;
        if (this.freeSpinElements && this.freeSpinElements.maskGraphics) {
            maskGraphics = this.freeSpinElements.maskGraphics;
        } else {
            maskGraphics = this.make.graphics();
        }
        maskGraphics.clear();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(filledBar.x - filledBar.width / 2, filledBar.y - filledBar.height / 2, filledBar.width, filledBar.height);

        const mask = maskGraphics.createGeometryMask();
        filledBar.setMask(mask);
    
        // Update the mask based on freeSpinCount
        this.updateFillBar(freeSpinCount, maxFreeSpins, filledBar, maskGraphics);
    
        // Create the text object to display free spin count
        let freeText: Phaser.GameObjects.Text;
        if (this.freeSpinElements && this.freeSpinElements.freeText) {
            freeText = this.freeSpinElements.freeText;
            freeText.setText(freeSpinCount.toString());
        } else {
            freeText = this.add.text(this.cameras.main.width * 0.1, this.cameras.main.height * 0.23, freeSpinCount.toString(), {
                font: '55px',
                color: '#ffffff'
            }).setDepth(13).setOrigin(0.5);
        }    
        // Store references to objects that need updating
        this.freeSpinElements = {
            freeText,
            filledBar,
            maskGraphics,
            initialCount: freeSpinCount,
            maxFreeSpins,
            currentCount: freeSpinCount
        };
        // Start the free spin sequence
        this.startFreeSpinSequence();
    }

    startFreeSpinSequence() {
    if (this.freeSpinElements) {                                                                                                                         
            this.updateFillBar(this.freeSpinElements.currentCount, this.freeSpinElements.initialCount, this.freeSpinElements.filledBar, this.freeSpinElements.maskGraphics);
            // Set a timeout before starting the spins (e.g., 7 seconds)
            this.time.delayedCall(7000, () => {
                this.startFreeSpins(this.freeSpinElements!.currentCount);
            });
        }
    }
    
    startFreeSpins(freeSpinCount: number) {
            this.uiContainer.callFreeSpin(freeSpinCount, () => {
                this.processFreeSpins();
                this.soundManager.playSound("onSpin");
                this.slot.moveReel();
                this.lineGenerator.hideLines();
            });
    }

    processFreeSpins() {
        if (this.freeSpinElements && this.freeSpinElements.currentCount > 0) {
            this.freeSpinElements.currentCount--;
            // this.freeSpinElements.freeText.setText(this.freeSpinElements.currentCount.toString());
            // Store references to needed properties to avoid null checks in the tween
            const { maskGraphics, filledBar, currentCount, maxFreeSpins } = this.freeSpinElements;
    
            this.tweens.add({
                targets: maskGraphics,
                fillHeight: {
                    from: filledBar.height * (currentCount + 1) / maxFreeSpins,
                    to: filledBar.height * currentCount / maxFreeSpins
                },
                duration: 1000,
                ease: 'Power2',
                onUpdate: () => {
                    this.updateFillBar(currentCount, maxFreeSpins, filledBar, maskGraphics);
                },
                onComplete: () => {
                    if (this.freeSpinElements) { 
                        if (this.freeSpinElements.currentCount > 0) {
                            // this.time.delayedCall(7000, () => {
                            //     this.processFreeSpins();
                            // });
                        } else {
                            if (this.inputOverLay) {
                                this.inputOverLay.destroy();
                            }
    
                            // Destroy filledBar
                            if (this.freeSpinElements.filledBar) {
                                this.freeSpinElements.filledBar.destroy();
                            }
    
                            // Destroy maskGraphics
                            if (this.freeSpinElements.maskGraphics) {
                                this.freeSpinElements.maskGraphics.destroy();
                            }
    
                            // Destroy emptyBar
                            if (this.emptyBar) {
                                this.emptyBar.destroy();
                            }
    
                            // Destroy freeText
                            if (this.freeSpinElements.freeText) {
                                this.freeSpinElements.freeText.destroy();
                            }
    
                        }
                    }
                }
            });
        }
    }

    updateFillBar(currentCount: number, maxCount: number, filledBar: Phaser.GameObjects.Sprite, maskGraphics: Phaser.GameObjects.Graphics) {
        const fillPercentage = Math.min(currentCount / maxCount, 1);
        const fillHeight = filledBar.height * fillPercentage;
        maskGraphics.clear();
        maskGraphics.fillStyle(0xffffff);
        // Calculate the y position for the bottom of the fill
        const fillBottom = filledBar.y + filledBar.height / 2;
        maskGraphics.fillRect(
            filledBar.x / 1.255,  // Left edge
            fillBottom - fillHeight,            // Top edge (moving upwards)
            filledBar.width,                    // Width of the fill
            fillHeight                          // Height of the fill
        );
    }
    private showWinPopup(winAmount: number, spriteKey: string) {
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(9)
            .setInteractive();

        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation(); 
        });

        const winBg = this.add.sprite(gameConfig.scale.width/2, gameConfig.scale.height/2, "coinsBg").setDepth(11).setOrigin(0.5);
        let winSprite: any
        if(spriteKey == "jackpotPopup"){
            winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, spriteKey).setDepth(11).setOrigin(0.5).setScale(0.8);
        }else{
            winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 150, spriteKey).setDepth(11).setOrigin(0.5).setScale(0.8);

        }
            // Create the text object to display win amount
            const winText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 240, '0', {
                font: '80px',
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
                        // winAmountPanel.destroy();
                        winText.destroy();
                        winSprite.destroy();
                    });
                }
            });

    }
} 