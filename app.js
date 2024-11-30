//import MandelbrotSet from "./MandelbrotSet";

class DrawPicture{
    constructor() {
        this.mandelbrotSet = new MandelbrotSet();
    }

    init(){
        this.scale = Number(250);       // Отвечает за масштабирование множества
        this.percision = 100;     // Отвечает за точность(четкость) отрисовки
        this.panX = 0.8;          // Смещение по Х
        this.panY = 0.1;          // Смещение по Y
        this.scrolAngle = 0;

        this.oldX = this.oldY = 0;

        this.isMouseDown = false;

        this.createCanvas();
        this.setCanvasSize();
        //this.drawNoise();
        this.redrawCanvas();

        window.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.oldX = e.x;
            this.oldY = e.y;
        })
        window.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
        })
        window.addEventListener('mousemove', (e) => {
            if(this.isMouseDown){

                this.panX += (e.x - this.oldX) / this.scale;
                this.panY += (e.y - this.oldY) / this.scale;
                this.redrawCanvas();
            }
        })
        window.addEventListener('wheel', (e) => {
            this.scrolAngle += e.wheelDelta;
            if(e.wheelDelta > 0)
                this.scale += this.scale / 10;
            else
                this.scale -= this.scale / 10;

            this.redrawCanvas();
        })
        let btn = document.getElementById("confChanges");
        btn.onclick = (e)=>{
            this.applyNewParams();
            this.redrawCanvas();
        };
    }
    createCanvas(){
        this.cnv = document.createElement(`canvas`);
        this.cnv.style.background = 'rgba(255,255,255,0)';
        this.ctx = this.cnv.getContext('2d');

        document.body.appendChild(this.cnv);
    }
    setCanvasSize(){
        this.w = this.cnv.width = innerWidth;
        this.h = this.cnv.height = innerHeight;
        this.canvasArray = createMatrix(this.w, this.h);
        this.imgData = this.ctx.createImageData(this.w, this.h);

        this.dx = Math.floor(this.w * .5);
        this.dy = Math.floor(this.h * .5);
    }
    drawNoise(){
        for(let w = 0; w < this.w; w++){
            for(let h = 0; h < this.h; h++){
                let color = randColor("rgba");
                printDot(this.ctx, w, h, color);
            }
        }

        let p = {r: 255, g: 0, b: 0, a: 100};
        let rect = this.ctx.createImageData(20, 20);
        for (let i = 0; i < this.w*this.h*4; i += 4) {
            rect.data[i] = p.r;
            rect.data[i+1] = p.g;
            rect.data[i+2] = p.b;
            rect.data[i+3] = p.a;
        }
        this.ctx.putImageData(rect, 0, 0);
    }
    
    mandelbrot(){
        for(let x=0; x < this.cnv.width; x++) {
            for(let y=0; y < this.cnv.height; y++) {
                let color = this.mandelbrotSet.calcMandelbrotPoint(x,y,this.dx,this.dy,this.scale, this.panX, this.panY, this.percision);
                this.setPointInImgData(this.imgData, x, y, color);
            } 
        }
    }

    // Устанавливаем пиксель в позиции i, j 
    setPointInImgData(imgData, i, j, rgba){
        let iter = 4 * (i + imgData.width * j)
        imgData.data[iter + 0] = rgba.r;
        imgData.data[iter + 1] = rgba.g;
        imgData.data[iter + 2] = rgba.b;
        imgData.data[iter + 3] = rgba.a;
    }

    updateControlData(){
        let outElements = document.getElementById("outputs").getElementsByClassName("output");
        outElements.scale.textContent = this.scale;
        outElements.percision.textContent = this.percision;
        outElements.panX.textContent = this.panX;
        outElements.panY.textContent = this.panY;
        outElements.angle.textContent = this.scrolAngle;
        
        let form = document.forms.editParams;
        form.scaleControl.value = this.scale;
        form.percisionControl.value = this.percision;
        form.panXControl.value = this.panX;
        form.panYControl.value = this.panY;
        form.scrolAngleControl.value = this.scrolAngle;
    }
    applyNewParams(){
        console.log("kekWParams");
        let form = document.forms.editParams;

        let scaleElement = form.scaleControl;
        this.scale = Number(scaleElement.value);

        let percisionElement = form.percisionControl;
        this.percision = Number(percisionElement.value);

        let panXElement = form.panXControl;
        this.panX = Number(panXElement.value);

        let panYElement = form.panYControl;
        this.panY = Number(panYElement.value);

        let scrolAngleElement = form.scrolAngleControl;
        this.scrolAngle = Number(scrolAngleElement.value);
    }

    // Перерисовка полотна
    redrawCanvas(){
        this.mandelbrot();
        this.ctx.putImageData(this.imgData, 0, 0);
        this.updateControlData();
        this.ctx.strokeStyle = 'rgba(255,0,0,50)';
        this.ctx.strokeRect(this.w * 0.5, this.h * 0.5, 50, 50);
    }
}


onload = () => {
    //new App(document.querySelector('body'));
    var picture = new DrawPicture();
    picture.init();
}

function printDot(context, x, y, rgbaColor){
    context.fillStyle = rgbaColor;
    context.fillRect(x, y, 1, 1);
}

function randColor(format){
    let rint = Math.floor( 0x100000000 * Math.random());
    switch( format ){
      case 'hex':
        return '#' + ('00000'   + rint.toString(16)).slice(-6).toUpperCase();
      case 'hexa':
        return '#' + ('0000000' + rint.toString(16)).slice(-8).toUpperCase();
      case 'rgb':
        return 'rgb('  + (rint & 255) + ',' + (rint >> 8 & 255) + ',' + (rint >> 16 & 255) + ')';
      case 'rgba':
        return 'rgba(' + (rint & 255) + ',' + (rint >> 8 & 255) + ',' + (rint >> 16 & 255) + ',' + (rint >> 24 & 255)/255 + ')';
      default:
        return rint;
    }
}

function createMatrix(i, j) {
    let arr = new Uint8ClampedArray(i > 0 ? i : 0);
    if(i > 0 && j > 0){
        for(let iter = 0; iter < i; iter++)
            arr[iter] = new Uint8ClampedArray(j);
    }

    return arr;
}
function shiftedMatrix(matrix, x, y){
    if(matrix instanceof Array && matrix[0] instanceof Array){
        for(let i = 0; i < matrix.length + x; i++)
            for(let j = 0; j < matrix[i].length + y; j++){
                matrix[i][j] = matrix[i+x][j+y];                
            }
    }
}

function onClickButtonHandler(){
    console.log("kekPucW");
}


function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255)};
}
