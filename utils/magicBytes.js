const fs = require('fs');

function readBytes(filePath, n = 12) {
  const buf = Buffer.alloc(n);
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, n, 0);
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
  return buf;
}

function starts(buf, bytes) {
  return bytes.every((b, i) => buf[i] === b);
}

function isValidImage(filePath) {
  try {
    const b = readBytes(filePath);
    if (starts(b, [0xFF, 0xD8, 0xFF])) return true;                                    // JPEG
    if (starts(b, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return true;    // PNG
    if (starts(b, [0x47, 0x49, 0x46, 0x38])) return true;                              // GIF
    if (b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&                          // WebP
        b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50) return true;
    return false;
  } catch { return false; }
}

function isValidDocument(filePath) {
  try {
    const b = readBytes(filePath);
    if (starts(b, [0x25, 0x50, 0x44, 0x46])) return true;  // PDF
    if (starts(b, [0xD0, 0xCF, 0x11, 0xE0])) return true;  // DOC / XLS (OLE2)
    if (starts(b, [0x50, 0x4B, 0x03, 0x04])) return true;  // DOCX / XLSX (ZIP)
    return false;
  } catch { return false; }
}

module.exports = { isValidImage, isValidDocument };
