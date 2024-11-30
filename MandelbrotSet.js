class MandelbrotSet {
    constructor() {
    }

    /*
    * Count if point (x, y) belongs to Mandelbrot set.
    * return: 0 - in set; 1-255 escapeTime;
    * */
    calcEscapeTime(x, y, maxIter) {
        let realComp = x;
        let imgComp = y;

        for (let i = 0; i < maxIter; i++) {
            let tempRealComp = realComp * realComp - imgComp * imgComp + x;
            let tempImgComp = 2 * realComp * imgComp + y;

            realComp = tempRealComp;
            imgComp = tempImgComp;

            if (realComp * imgComp > 4) {
                return i * 255 / maxIter; // escapeTime of point
            }
        }

        return 0; // In the Mandelbrot set
    }

    /*
    * Calculate point in Mandelbrot set.
    * return: [x, y, rgbaColor]
    * */
    calcMandelbrotPoint(x, y, dx, dy, scale, panX, panY, maxIter) {
        let escapeTime = this.calcEscapeTime(
            (x - dx) / scale - panX,
            (y - dy) / scale - panY,
            maxIter
        );

        if (escapeTime === 0) {
            return { r: 0, g: 0, b: 0, a: 255 };
        } else {
            return {
                r: (escapeTime * 17) % 256,
                g: (escapeTime * 11) % 256,
                b: 255,
                a: 255
            };
        }
    }
}

//export default MandelbrotSet;