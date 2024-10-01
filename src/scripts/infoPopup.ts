import Phaser, { Scene } from "phaser";
import { Globals, initData, ResultData } from "./Globals";
import { gameConfig } from "./appconfig";
const TextStyle = { fontFamily: "BabasKai", fontSize: '30px', color: '#dab47b', align: "left", wordWrap: { width: 1200, useAdvancedWrap: true } };

export default class InfoScene extends Scene{
    pageviewContainer!: Phaser.GameObjects.Container;
    popupBackground!: Phaser.GameObjects.Sprite;
    SceneBg!: Phaser.GameObjects.Sprite;
    scrollContainer!: Phaser.GameObjects.Container;
    scrollbarBg!: Phaser.GameObjects.Sprite;
    roller!: Phaser.GameObjects.Sprite
    constructor(){
        super({key: 'InfoScene'})
    }
    create(){
        const { width, height } = this.cameras.main;
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'Background')
            .setDisplaySize(width, height)
            .setDepth(11)
            .setInteractive();
        this.SceneBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });
        this.openInfoPopup(); // Call the new popup function
    }
    openInfoPopup() {
        // 1. Create the main popup container 
        const popupContainer = this.add.container(0, 0).setDepth(11);

        // 2. Add a background to the popup container 
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setDepth(16)
            .setInteractive();
    
        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });
        popupContainer.add(inputOverlay);

        // 3. Add a heading image to the popup container (You can adjust or remove this)
        const headingImage = this.add.image(gameConfig.scale.width / 2, gameConfig.scale.height / 2 - 400, 'headingImage');
        popupContainer.add(headingImage);

        // 4. Add a close button to the popup 
        const closeButton = this.add.sprite(gameConfig.scale.width / 2 + 800, gameConfig.scale.height / 2 - 400, 'exitButton')
            .setInteractive()
        closeButton.on('pointerdown', () => {
            if(Globals.SceneHandler?.getScene("InfoScene")){
                Globals.SceneHandler.removeScene("InfoScene")
            }
        });
        popupContainer.add(closeButton);

        // 5. Create a mask to define the visible area for scrolling 
        const maskShape = this.make.graphics().fillRect(
            0, // Adjust X position to center 
            gameConfig.scale.height / 2 - 300, // Adjust Y position 
            gameConfig.scale.width - 100, // Full width minus some padding 
            800 // Desired height of the scrollable area 
        );
        const mask = maskShape.createGeometryMask();

        // 6. Add the scrollable container to the popup container 
        this.scrollContainer = this.add.container(
            0, // Adjust X position to align with the mask
            gameConfig.scale.height / 2 - 300 // Adjust Y position
        );
        this.scrollContainer.setMask(mask); // Apply the mask to the scroll container 
        popupContainer.add(this.scrollContainer);

        // 7. Add the content that will be scrolled 
        this.addScrollableContent();

        // 8. Scrollbar background 
        this.scrollbarBg = this.add.sprite(gameConfig.scale.width - 160, gameConfig.scale.height / 2, 'scrollBg') .setOrigin(0.5)
           
        popupContainer.add(this.scrollbarBg);

        // 9. Roller image for the scrollbar 
        this.roller = this.add.sprite(gameConfig.scale.width - 160, gameConfig.scale.height / 2 , 'scroller').setOrigin(0.5).setInteractive({ draggable: true })
        popupContainer.add(this.roller);

        // 10. Add drag event listener to the roller 
        this.input.setDraggable(this.roller);
        this.roller.on('drag', (pointer: any, dragX: number, dragY: number) => {
            this.updateScrollPosition(this.roller, this.scrollbarBg, dragY);
        });

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            const newY = this.roller.y + deltaY * 0.1; // Adjust speed of scroll
            this.updateScrollPosition(this.roller, this.scrollbarBg, newY);
        });
    }

    addScrollableContent() {
        const content = this.add.image(gameConfig.scale.width / 2, 150, 'minorSymbolsHeading').setOrigin(0.5).setDepth(2);
        const minSymbol1 = this.add.image(600, 350, "slots0_0").setDepth(2).setScale(0.8) 
        const minSymbol2 = this.add.image(1050, 350, "slots1_0").setDepth(2).setScale(0.8) 
        const minSymbol3 = this.add.image(600, 550, "slots2_0").setDepth(2).setScale(0.8) 
        const minSymbol4 = this.add.image(1050, 550, "slots3_0").setDepth(2).setScale(0.8) 
        const infoIcons = [
            { x: 750, y: 300 }, // Position for infoIcon2
            { x: 1200, y: 300 }, // Position for infoIcon3
            { x: 750, y: 500 }, //
            { x: 1200, y: 500 }, //
            // { x: 1200, y: 500 }, //
        ]
        const minorIcon = initData.UIData.symbols
        minorIcon.forEach((symbol, symbolIndex) => {
            // Get the corresponding infoIcon position
            const iconPosition = infoIcons[symbolIndex];
            if (!iconPosition) return; // Avoid undefined positions
            // Loop through each multiplier array (e.g., [100, 0], [50, 0])
            symbol.multiplier.slice(0, 3).forEach((multiplierValueArray, multiplierIndex) => {
                // Ensure multiplierValueArray is an array before accessing elements
                if (Array.isArray(multiplierValueArray)) {
                    const multiplierValue = multiplierValueArray[0]; // Access the first value of the array
                    if (multiplierValue > 0) {  // Only print if the value is greater than 0
                        // Determine the text (e.g., '5x', '4x', '2x')
                        const prefix = [5, 4, 2][multiplierIndex] || 1; // Customize this if needed
                        // Create the text content
                        const text = `${prefix}x ${multiplierValue}`;
                        // Create the text object
                        const textObject = this.add.text(
                            iconPosition.x, // X position
                            iconPosition.y + multiplierIndex * 40, // Y position (spacing between lines)
                            text,
                           TextStyle
                        );
                        // Set line spacing and other styles
                        textObject.setLineSpacing(10);  // Adjust the line height as needed
                        textObject.setOrigin(0.5, 0.5); // Center the text if needed
                        this.scrollContainer.add(textObject);
                    }
                }
            });
        });    
        const MajorSymBolHeading = this.add.image( gameConfig.scale.width / 2, 800, 'majorSymbolHeading' ).setOrigin(0.5).setDepth(2);  
        const minSymbol5 = this.add.image(350, 950, "slots4_0").setDepth(2).setScale(0.8)               
        const majorSymbol1 = this.add.image(850, 950, "slots5_0").setDepth(2).setScale(0.8) 
        const majorSymbol2 = this.add.image(1350, 950, "slots6_0").setDepth(2).setScale(0.8) 
        const majorSymbol3 = this.add.image(650, 1150, "slots7_0").setDepth(2).setScale(0.8) 
        const majorSymbol4 = this.add.image(1050, 1150, "slots8_0").setDepth(2).setScale(0.8) 
        const majorSymbol1Text = this.add.text(500, 900, '5X - 80 \n4X - 30 \n3X - 15', TextStyle) 
        const majorSymbol2Text = this.add.text(1000, 900, '5X - 80 \n4X - 30 \n3X - 15', TextStyle) 
        const majorSymbol3Text = this.add.text(1500, 900, '5X - 80 \n4X - 30 \n3X - 15', TextStyle) 
        const majorSymbol4Text = this.add.text(800, 1100, '5X - 80 \n4X - 30 \n3X - 15', TextStyle )
        const majorSymbol5Text = this.add.text(1200, 1100, '5X - 80 \n4X - 30 \n3X - 15', TextStyle )
        const specialSymBolHeading = this.add.image(gameConfig.scale.width / 2, 1400, "specialSymBolHeading").setDepth(2).setOrigin(0.5)
        const specialSymBol1 = this.add.image(200, 1600, "slots9_0").setDepth(2).setOrigin(0.5).setScale(0.8)
        const specialSymBol2 = this.add.image(200, 1800, "slots10_0").setDepth(2).setOrigin(0.5).setScale(0.8)
       const payLineHead = this.add.image(gameConfig.scale.width / 2, 1950, "payLinesHeading")
      
        const descriptionPos = [ 
            {x: 350, y: 1550},
            {x: 350, y: 1750},
        ]

        for (let i = 9; i <= 10; i++) {
            const symbol = initData.UIData.symbols[i];
            if (symbol) {
                const position = descriptionPos[i - 9];
                const descriptionText = `${symbol.description}`;
                // Create the text object
               const descriptionObject = this.add.text(
                        position.x, // X position
                        position.y +  40, // Y position (spacing between lines)
                        descriptionText,
                        TextStyle
                );
                descriptionObject.setLineSpacing(10);  // Adjust the line height as needed
                descriptionObject.setOrigin(0, 0.5); // Center the text if needed
                this.scrollContainer.add(descriptionObject)
            } else {
            }
        }
        const payLines = this.add.image( gameConfig.scale.width / 2, 2300, 'payLines' ).setOrigin(0.5).setDepth(2);
        this.scrollContainer.add([content,minSymbol1,minSymbol2,
            minSymbol3,  minSymbol4,  minSymbol5,
            MajorSymBolHeading, majorSymbol1, majorSymbol1Text, majorSymbol2, majorSymbol2Text, 
            majorSymbol3,majorSymbol3Text, majorSymbol4, majorSymbol4Text, majorSymbol5Text, specialSymBolHeading, specialSymBol1, specialSymBol2, payLineHead, payLines
        ]); 
       
        // 10. Add drag event listener to the roller 
        // this.input.setDraggable(this.roller); 
        // this.roller.on('drag', (pointer: any, dragX: number, dragY: number) => {
        //     const minY = this.scrollbarBg.getTopCenter().y + this.roller.height / 2 ;
        //     const maxY = this.scrollbarBg.getBottomCenter().y - this.roller.height ;
        //     dragY = Phaser.Math.Clamp(dragY, minY, maxY);
        //     this.roller.y = dragY;
        // });

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            const minY = this.scrollbarBg.getTopCenter().y + this.roller.height / 2;
            const maxY = this.scrollbarBg.getBottomCenter().y - this.roller.height / 2;
            let newY = this.roller.y + deltaY * 0.1; // Adjust speed of scroll
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            this.roller.y = newY;
        });


        this.scrollContainer.add([
            content,
            // ... (Add your other content elements here) ...
        ]);
    }
    updateScrollPosition(roller: Phaser.GameObjects.Image, scrollbarBg: Phaser.GameObjects.Sprite, dragY: number) {
        // Keep the roller within the scrollbar bounds
        const minY = scrollbarBg.getTopCenter().y + roller.height / 2;
        const maxY = scrollbarBg.getBottomCenter().y - roller.height;

        // Clamp roller position
        dragY = Phaser.Math.Clamp(dragY, minY, maxY);
        roller.y = dragY;

        // Calculate the scroll percentage (0 to 1)
        const scrollPercent = (dragY - minY) / (maxY - minY);
        const contentHeight = 2100; // Example content height, adjust as needed 
        const contentMaxY = 160; // The top position of content (relative to mask)
        const contentMinY = -(contentHeight - 500); // The bottom position of content relative to mask

        // Update scroll container's Y position based on scroll percentage
        this.scrollContainer.y = Phaser.Math.Interpolation.Linear([contentMaxY, contentMinY], scrollPercent);
    }
}