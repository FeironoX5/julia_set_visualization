import {AfterContentInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {MatCard, MatCardContent} from "@angular/material/card";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgIf, NgStyle} from "@angular/common";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        MatLabel,
        MatGridTile, MatGridList, MatFormField, MatInput, MatSlider, MatCard, MatCardContent, MatSliderThumb, FormsModule, MatButton, MatProgressBar, MatProgressSpinner, NgStyle, NgIf
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements AfterContentInit {
    cReal: number = 0.28;
    cImaginary: number = 0.0113;
    maxIterations: number = 300;
    zoomLevel: number = 1;
    xOffset: number = 0;
    yOffset: number = 0;
    progress: number = 0;

    ngAfterContentInit() {
        this.render();
    }

    constructor(private cdr: ChangeDetectorRef) {
    }

    render() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const canvasWidth = canvas.offsetWidth;
        const canvasHeight = canvas.offsetHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(canvasWidth, canvasHeight);


        function fillPixel(pixelY: number, pixelX: number, k: number) {
            const pixelIndex = (pixelX * canvasWidth + pixelY) * 4;
            imageData.data[pixelIndex] = k;
            imageData.data[pixelIndex + 1] = k;
            imageData.data[pixelIndex + 2] = k;
            imageData.data[pixelIndex + 3] = 255;
        }

        this.progress = 0;
        const updateProgress = () => this.cdr.detectChanges();
        const processRow = (pixelY: number) => {
            for (let pixelX = 0; pixelX < canvasWidth; pixelX++) {
                const centerX = canvasWidth / 2;
                const centerY = canvasHeight / 2;
                const zoomFactor = this.getZoomFactor();
                const zReal = (pixelX - centerX) / (canvasWidth * zoomFactor) + this.xOffset;
                const zImaginary = (pixelY - centerY) / (canvasHeight * zoomFactor) + this.yOffset;

                let z = {real: zReal, imag: zImaginary};
                let i;
                for (i = 0; i < this.maxIterations; i++) {
                    if (Math.hypot(z.real, z.imag) > 2.0) break;
                    z = {
                        real: z.real * z.real - z.imag * z.imag + this.cReal,
                        imag: 2 * z.real * z.imag + this.cImaginary
                    };
                }
                fillPixel(pixelX, pixelY, (i / this.maxIterations) * 255);
            }
            this.progress = (pixelY + 1) / canvasHeight * 100;
            updateProgress();
            if (pixelY + 1 < canvasHeight) {
                requestAnimationFrame(() => processRow(pixelY + 1));
            } else {
                ctx.putImageData(imageData, 0, 0);
            }
        };

        requestAnimationFrame(() => processRow(0));
    }

    getZoomFactor() {
        return Math.pow(2, this.zoomLevel);
    }
}
