var Jimp = require("jimp");
var Canvas = require('canvas');
const fs = require("fs");

var fileName = 'image.png';
var imageCaption = 'Mahmoud Ashraf Mahmoud';
var loadedImage;

function imageToPdf(imageBuffer) {
    const img = new Canvas.Image();
    img.src = imageBuffer;
    const canvas = Canvas.createCanvas(img.width, img.height, 'pdf');
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);
    return canvas.toBuffer();
  }

Jimp.read(fileName)
    .then(function (image) {
        loadedImage = image;
        return Jimp.loadFont('./font.fnt');
    })
    .then(function (font) {
        loadedImage.print(font, 120, 425, imageCaption.toUpperCase())
        return loadedImage.getBufferAsync(Jimp.MIME_PNG)
    })
    .then(function(buffer){
        const pdf = imageToPdf(buffer)
        fs.writeFileSync("./out.pdf", pdf);
    })
    .catch(function (err) {
        console.error(err);
    });