const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  if (!req.query.name || req.query.name.length < 3)
    return res
      .status(400)
      .json({ error: 'No name or name less than 3 letters' });

  let fileName = path.join(__dirname, 'image.png');
  let fontName = path.join(__dirname, 'font.ttf');
  let nameText = req.query.name.toUpperCase().split(' ').slice(0, 3).join(' ');

  const image = await loadImage(fileName);

  registerFont(fontName, { family: '29LT Kaff' });

  const canvas = createCanvas(image.width, image.height, 'pdf');
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  ctx.font = '32px "29LT Kaff Semi-Bold"';
  ctx.fillStyle = '#11BAB1';
  ctx.fillText(nameText, 120, 455);

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${nameText}.pdf"`,
  });
  const stream = canvas.createPDFStream();
  stream.pipe(res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
