import Phaser from "phaser";
import { initData } from "./Globals";
import { gameConfig } from "./appconfig";

let xOffset = -1;
let yOffset = -1;

export class LineGenerator extends Phaser.GameObjects.Container {
    lineArr: Lines[] = [];
    numberArr: Phaser.GameObjects.Text[] = [];

    constructor(scene: Phaser.Scene, yOf: number, xOf: number) {
        super(scene);
        xOffset = xOf;
        yOffset = yOf;

        // Create lines based on initData
        for (let i = 0; i < initData.gameData.Lines.length; i++) {
            let line = new Lines(scene, i);
            this.add(line);
            this.lineArr.push(line);
        }
        this.setPosition(gameConfig.scale.width / 4.25, gameConfig.scale.height/2.9);
        // Add this Container to the scene
        scene.add.existing(this);
    }


    showLines(lines: number[]) {
        // console.log(lines, "lines");
        
        lines.forEach(lineIndex => {
            if (lineIndex >= 0 && lineIndex < this.lineArr.length) {
                // console.log(this.lineArr[lineIndex], "this.lineArr[lineIndex]");
                this.lineArr[lineIndex].showLine();
            }
        });
    }

    hideLines() {
        this.lineArr.forEach(line => line.hideLine());
    }
}

export class Lines extends Phaser.GameObjects.Container {
    lineSprites: Phaser.GameObjects.Sprite[] = [];
    lineGraphics: Phaser.GameObjects.Graphics[] = [];

    constructor(scene: Phaser.Scene, index: number) {
        super(scene);

        const yLineOffset = 100;
        const points = initData.gameData.Lines[index];

        for (let i = 0; i < points.length - 1; i++) {
            const startX = i * xOffset;
            const startY = yOffset * points[i] - yLineOffset;
            const endX = (i + 1) * xOffset;
            const endY = yOffset * points[i + 1] - yLineOffset;

            const lineGraphic = this.createLineGraphic(scene, startX, startY, endX, endY);
            this.lineGraphics.push(lineGraphic);
            this.add(lineGraphic);
        }
        // Initialize all line sprites to be invisible
        this.hideLine();
        // Add this Container to the scene
        scene.add.existing(this);
    }

    createLineGraphic(scene: Phaser.Scene, startX: number, startY: number, endX: number, endY: number): Phaser.GameObjects.Graphics {
        const lineGraphic = scene.add.graphics();

        // Set line style (golden color, thickness)
        lineGraphic.lineStyle(10, 0x6a3818, 1); // 0xFFD700 is a hex code for gold

        // Draw the line
        lineGraphic.beginPath();
        lineGraphic.moveTo(startX, startY);
        lineGraphic.lineTo(endX, endY);
        lineGraphic.strokePath();

        // Initialize graphic as invisible
        lineGraphic.setVisible(false);

        return lineGraphic;
    }
    showLine() {
        this.lineGraphics.forEach(graphic => graphic.setVisible(true));
        // this.lineSprites.forEach(sprite => sprite.setVisible(true));
    }

    hideLine() {
        this.lineGraphics.forEach(graphic => graphic.setVisible(false));
        // this.lineSprites.forEach(sprite => sprite.setVisible(false));
    }
}
