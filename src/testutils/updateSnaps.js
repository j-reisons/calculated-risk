import fs from 'fs';
import path from 'path';

const dir = process.cwd();

const snapshotsDir = path.join(dir, 'src', 'solver', '__snapshots__');
const prefixToRemove = '__newsnap__.';

fs.readdir(snapshotsDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    process.exit(1);
  }

  files.forEach((file) => {
    if (file.startsWith(prefixToRemove)) {
      const oldFilePath = path.join(snapshotsDir, file);
      const newFileName = file.substring(prefixToRemove.length);
      const newFilePath = path.join(snapshotsDir, newFileName);

      fs.rename(oldFilePath, newFilePath, (renameErr) => {
        if (renameErr) {
          console.error(`Error renaming file "${file}":`, renameErr);
          process.exit(1);
        }
      });
    }
  });
});