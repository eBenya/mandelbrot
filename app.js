class DrawPicture{
    init(){
        this.scale = 250;       // Отвечает за масштабирование множества
        this.percision = 50;    // Отвечает за точность(четкость) отрисовки
        this.panX = 2;          // Смещение по Х
        this.panY = 1.5;        // Смещение по Y
        this.scrolAngle = 0;

        this.oldX = this.oldY = 0;

        this.isMouseDown = false;

        this.createCanvas();
        this.setCanvasSize();
        //this.drawNoise();
        this.mandelbrot();
        this.drawCanvasArray();
        this.updateControlData();

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
                this.complexDraw();
            }
        })
        window.addEventListener('wheel', (e) => {
            //console.log(`x:${e.x} y:${e.y}; delata:${e.wheelDelta}`)
            this.scrolAngle += e.wheelDelta;
            this.scale += this.scrolAngle / 100;
            this.percision += this.scale * this.scrolAngle / 100000;
            
            if(this.percision > 300)
                this.percision = 300;
            if(this.percision < 30)
                this.percision = 30;
            
            this.complexDraw();
        })
    }
    createCanvas(){
        this.cnv = document.createElement(`canvas`);
        this.cnv.style.background = 'rgba(255,255,255,0)'//randColor('rgba');
        this.ctx = this.cnv.getContext('2d');

        document.body.appendChild(this.cnv);
    }
    setCanvasSize(){
        this.w = this.cnv.width = innerWidth;
        this.h = this.cnv.height = innerHeight;
        this.canvasArray = createMatrix(this.w, this.h);
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
                let isBelongsToSet = 
                        this.checkIfBelongsToMandelbrotSet(x/this.scale - this.panX, 
                                                    y/this.scale - this.panY);
                if(isBelongsToSet == 0) {
                    //this.ctx.fillStyle = '#000';
                    //this.ctx.fillRect(x,y, 1,1); // Draw a black pixel
                    this.canvasArray[x][y] = '#000';
                } else {
                    //this.ctx.fillStyle = `hsl(0, 100%, ${isBelongsToSet}%)`;
                    //this.ctx.fillRect(x,y, 1,1); // Draw a colorful pixel
                    this.canvasArray[x][y] = `hsl(0, 100%, ${isBelongsToSet}%)`;
                }          
            } 
        }
    }
    drawCanvasArray(){
        for(let i = 0; i < this.canvasArray.length; i++)
            for(let j = 0; j < this.canvasArray[i].length; j++){
                printDot(this.ctx, i, j, this.canvasArray[i][j]);
            }
    }
    checkIfBelongsToMandelbrotSet(x, y) {
        let realComp = x;
        let imgComp = y;
        
        let i = 0;
        for(; i < this.percision; i++) {
            // Calculate the realComp and imaginary components of the result
            // separately
            let tempRealComp = realComp * realComp
                                    - imgComp * imgComp
                                    + x;
    
            let tempImgComp = 2 * realComp * imgComp
                                    + y;
    
            realComp = tempRealComp;
            imgComp = tempImgComp;
        }
    
        if (realComp * imgComp < 5)
            return i / this.percision * 100; // In the Mandelbrot set
    
        return 0; // Not in the set
    }
    updateControlData(){
        let scaleElement = document.getElementById("scaleControl");
        scaleElement.value = this.scale;

        let percisionElement = document.getElementById("percisionControl");
        percisionElement.value = this.percision;

        let panXElement = document.getElementById("panXControl");
        panXElement.value = this.panX;

        let panYElement = document.getElementById("panYControl");
        panYElement.value = this.panY;

        let scrolAngleElement = document.getElementById("scrolAngleControl");
        scrolAngleElement.value = this.scrolAngle;
    }
    complexDraw(){
        this.mandelbrot();
        this.drawCanvasArray();
        this.updateControlData();
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
    new DrawPicture().init();
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