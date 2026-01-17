const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient (purple)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw chart line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size/20);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(size*0.2, size*0.7);
  ctx.lineTo(size*0.35, size*0.5);
  ctx.lineTo(size*0.5, size*0.6);
  ctx.lineTo(size*0.65, size*0.3);
  ctx.lineTo(size*0.8, size*0.4);
  ctx.stroke();
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
});

console.log('All icons created!');
