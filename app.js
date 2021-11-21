class DrawPicture{
    init(){
        const DEFAULT_SCALE = 250;
        this.scale = new Number(250);       // Отвечает за масштабирование множества
        this.percision = 100;    // Отвечает за точность(четкость) отрисовки
        this.panX = 2;          // Смещение по Х
        this.panY = 1.5;        // Смещение по Y
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
            //console.log("mouseDown!");
        })
        window.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
            //console.log("mouseUp!!!");
        })
        window.addEventListener('mousemove', (e) => {
            if(this.isMouseDown){

                this.panX += (e.x - this.oldX) / this.scale;
                this.panY += (e.y - this.oldY) / this.scale;
                this.redrawCanvas();
            }
        })
        window.addEventListener('wheel', (e) => {
            //console.log(`x:${e.x} y:${e.y}; delata:${e.wheelDelta}`)
            this.scrolAngle += e.wheelDelta;
            if(e.wheelDelta > 0)
                this.scale += this.scale / 10;
            else
                this.scale -= this.scrolAngle / 10;
            //this.percision += this.scale * this.scrolAngle / 100000;
            
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
        //this.cnv = document.getElementsByTagName('canvas');
        this.cnv.style.background = 'rgba(255,255,255,0)'//randColor('rgba');
        this.ctx = this.cnv.getContext('2d');

        document.body.appendChild(this.cnv);
    }
    setCanvasSize(){
        this.w = this.cnv.width = innerWidth;
        this.h = this.cnv.height = innerHeight;
        this.canvasArray = createMatrix(this.w, this.h);
        this.imgData = this.ctx.createImageData(this.w, this.h);
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
        this.testSet = new Set();    
        for(let x=0; x < this.cnv.width; x++) {
            for(let y=0; y < this.cnv.height; y++) {
                let isBelongsToSet = 
                        this.checkIfBelongsToMandelbrotSet(x/this.scale - this.panX, 
                                                    y/this.scale - this.panY);
                this.testSet.add(isBelongsToSet);
                if(isBelongsToSet == 0) {
                    this.setPointInImgData(this.imgData, x, y, {r:0, g:0, b:0, a:255});
                } else {
                    this.setPointInImgData(this.imgData, x, y, {r:(isBelongsToSet * 17) % 256, g:(isBelongsToSet * 11) % 256, b:255, a:255});
                }
            } 
        }
    }    
    checkIfBelongsToMandelbrotSet(x, y) {
        let realComp = x;
        let imgComp = y;
        
        let i = 0;
        for(; i < this.percision; i++) {            
            let tempRealComp = realComp * realComp
                                    - imgComp * imgComp
                                    + x;
    
            let tempImgComp = 2 * realComp * imgComp
                                    + y;
    
            realComp = tempRealComp;
            imgComp = tempImgComp;
            if (realComp * imgComp > 5)
            return i * 255 / this.percision; // In the Mandelbrot set
        }       
    
        return 0; // Not in the set
    }
    drawCanvasArray(){
        for(let i = 0; i < this.canvasArray.length; i++)
            for(let j = 0; j < this.canvasArray[i].length; j++){
                printDot(this.ctx, i, j, this.canvasArray[i][j]);
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
        this.testSet.forEach(element => {
            console.log(element);
        });
        //this.drawCanvasArray();
        this.ctx.putImageData(this.imgData, 0, 0);
        this.updateControlData();
        this.ctx.strokeStyle = 'rgba(255,0,0,50)';
        this.ctx.strokeRect(this.w * 0.5, this.h * 0.5, 50, 50);
    }
}

class App{
    constructor(container) {
        this.layer = new Layer(container);
    }
}
class Layer {
    constructor(container){
        this.canvas = document.createElement(`canvas`);
        this.context = this.canvas.getContext(`2d`);
        
        container.appendChild(this.canvas);

        this.fitToContainer(this.canvas);
        addEventListener(`resize`, () => this.fitToContainer(this.canvas));
    }
    fitToContainer(cnv){
        cnv.width = cnv.offsetWidth;
        cnv.height = cnv.offsetHeight
    }
}

onload = () => {
    //new App(document.querySelector('body'));
    var picture = new DrawPicture();
    picture.init();
}

function printDot(context, x, y, colorR = 0, colorG = 0, colorB = 0, colorA = 0){
    context.fillStyle = `rgba(${colorR},${colorG},${colorB},${colorA})`;
    context.fillRect(x, y, 1, 1);
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
    let arr = new Array(i > 0 ? i : 0);
    if(i > 0 && j > 0){
        for(let iter = 0; iter < i; iter++)
            arr[iter] = new Array(j);
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







/*function drawDesk(ctx, offsetX, offsetY){
    ctx.fillStyle = 'black';
    ctx.strokeRect(offsetX + 15, offsetY + 15, 266, 266);
    ctx.strokeRect(offsetX + 18, offsetY + 18, 260, 260);
    ctx.fillRect(offsetX + 20, offsetY + 20, 256, 256);
    for (i = 0; i < 8; i += 2)
        for (j = 0; j < 8; j += 2) {
            let x1 = (20 + i * 32) + offsetX;
            let y1 = (20 + j * 32) + offsetY;
            let x2 = (20 + (i + 1) * 32) + offsetX;
            let y2 = (20 + (j + 1) * 32) + offsetY ;

            ctx.clearRect(x1, y1, 32, 32);
            ctx.clearRect(x2, y2, 32, 32);
        }
}            
function drawLines(ctx, offsetX, offsetY){
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(offsetX + 80, offsetY +  100, 56, 3/4 * Math.PI, 1/4 * Math.PI, true);
    ctx.fill(); // *14
    ctx.moveTo(offsetX + 40, offsetY + 140);
    ctx.lineTo(offsetX + 20, offsetY + 40);
    ctx.lineTo(offsetX + 60, offsetY + 100);
    ctx.lineTo(offsetX + 80, offsetY + 20);
    ctx.lineTo(offsetX + 100, offsetY + 100);
    ctx.lineTo(offsetX + 140, offsetY + 40);
    ctx.stroke(); // *22
    ctx.closePath();		
}
function drawOR(ctx, offsetX, offsetY){
    ctx.beginPath();
    ctx.moveTo(offsetX + 0,  offsetY + 0);
    ctx.lineTo(offsetX + 60, offsetY + 20);
    ctx.lineTo(offsetX + 0,  offsetY + 40);
    ctx.lineTo(offsetX + 0,  offsetY + 0);
    //ctx.moveTo()
    ctx.stroke();
}*/

/*var app = new Vue({
    el: '#app',
    data: {
        arr: [1,2,3],
        mess: 'kek',
        elementName: '',
        schem: {id: 0, keyName: 'box1', links:[]}
    }
});*/