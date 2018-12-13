export function fullColorHex ({r,g,b}) {   
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);    
    return red+green+blue;
};

function rgbToHex (rgb) {     
    var hex = Number(Math.round(rgb,0)).toString(16);    
    if (hex.length < 2) {
         hex = "0" + hex;
    }
    return hex;
};

export function interpolateColor (a, b, t) {

    return {
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t
    };
}