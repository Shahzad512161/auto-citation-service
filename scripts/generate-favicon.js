const fs = require("fs");
const path = require("path");

const width = 32;
const height = 32;
const bmpSize = 40 + (width * height * 4) + (width * height / 8);
const totalSize = 6 + 16 + bmpSize;

const buf = Buffer.alloc(totalSize);

// ICO Header
buf.writeUInt16LE(0, 0); // Reserved
buf.writeUInt16LE(1, 2); // Type 1 = ICO
buf.writeUInt16LE(1, 4); // 1 Image

// Directory Entry
buf.writeUInt8(width, 6);
buf.writeUInt8(height, 7);
buf.writeUInt8(0, 8); // Color count
buf.writeUInt8(0, 9); // Reserved
buf.writeUInt16LE(1, 10); // Color planes
buf.writeUInt16LE(32, 12); // Bits per pixel
buf.writeUInt32LE(bmpSize, 14); // Image size
buf.writeUInt32LE(22, 18); // Offset

// BITMAPINFOHEADER
let off = 22;
buf.writeUInt32LE(40, off); off += 4; // Header size
buf.writeInt32LE(width, off); off += 4; // Width
buf.writeInt32LE(height * 2, off); off += 4; // Height doubled for ICO mask
buf.writeUInt16LE(1, off); off += 2; // Color planes
buf.writeUInt16LE(32, off); off += 2; // BPP
buf.writeUInt32LE(0, off); off += 4; // Compression BI_RGB
buf.writeUInt32LE(width * height * 4, off); off += 4; // Image data size
buf.writeInt32LE(0, off); off += 4;
buf.writeInt32LE(0, off); off += 4;
buf.writeUInt32LE(0, off); off += 4;
buf.writeUInt32LE(0, off); off += 4;

// Pixel data: bottom-to-top, left-to-right in BGRA
for (let y = height - 1; y >= 0; y--) {
  for (let x = 0; x < width; x++) {
    const dx = x - 15.5;
    const dy = y - 15.5;
    const squircle = Math.pow(Math.abs(dx) / 14, 4) + Math.pow(Math.abs(dy) / 14, 4);
    
    let blue = 0, green = 0, red = 0, alpha = 0;
    
    if (squircle <= 1.0) {
      const t = (x + y) / (width * 2);
      blue = 255;
      green = Math.min(255, Math.floor(111 + (210 - 111) * t));
      red = Math.floor(15 * (1 - t));
      alpha = 255;
      
      const diag1 = x - y;
      const diag2 = (x + y) - 31;
      
      if (Math.abs(diag1) <= 3 && diag2 >= -2 && diag2 <= 14) {
        blue = 255; green = 255; red = 255;
      } else if (Math.abs(diag1) <= 7 && diag2 >= -4 && diag2 <= 2) {
        blue = 245; green = 200; red = 160;
      } else if (Math.abs(diag1) <= 3 && diag2 < -2 && diag2 >= -8) {
        blue = 30; green = 140; red = 250;
      }
      if (Math.abs(x - 19) <= 1 && Math.abs(y - 19) <= 1) {
        blue = 255; green = 111; red = 15;
      }
    }
    
    buf.writeUInt8(blue, off++);
    buf.writeUInt8(green, off++);
    buf.writeUInt8(red, off++);
    buf.writeUInt8(alpha, off++);
  }
}

// AND mask
for (let i = 0; i < (width * height / 8); i++) {
  buf.writeUInt8(0, off++);
}

fs.writeFileSync("public/favicon.ico", buf);
fs.writeFileSync("app/favicon.ico", buf);
console.log("public/favicon.ico & app/favicon.ico generated successfully!");
