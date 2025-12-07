#!/usr/bin/env node

/**
 * Fix auth.service.js - Remove duplicate code blocks
 * 
 * This script:
 * 1. Reads the corrupted auth.service.js
 * 2. Removes duplicate method definitions (lines 692-873)
 * 3. Fixes the corrupted googleAuth error handler (lines 670-691)
 * 4. Keeps the deleteUser method (lines 902-943)
 * 5. Writes the clean file back
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../services/auth/auth.service.js');

console.log('Reading file...');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);

// The file should be ~708 lines, but it's 946 due to duplicates
// We need to remove lines 692-873 (duplicate methods)
// And fix lines 670-691 (corrupted error handler)

const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  
  // Skip duplicate methods (lines 692-873)
  if (lineNum >= 692 && lineNum <= 873) {
    continue;
  }
  
  // Fix corrupted googleAuth error handler
  if (lineNum === 674) {
    // Skip malformed line with duplicate email/userId
    continue;
  }
  if (lineNum >= 675 && lineNum <= 691) {
    // Skip all the corrupted catch blocks
    continue;
  }
  
  fixedLines.push(lines[i]);
}

// Add proper closing for googleAuth method after line 673
const insertIndex = 673 - 1; // Convert to 0-indexed
fixedLines.splice(insertIndex + 1, 0, '      });');
fixedLines.splice(insertIndex + 2, 0, '      throw error;');
fixedLines.splice(insertIndex + 3, 0, '    }');
fixedLines.splice(insertIndex + 4, 0, '  }');
fixedLines.splice(insertIndex + 5, 0, '');

const fixedContent = fixedLines.join('\n');

console.log('Writing fixed file...');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ File fixed!');
console.log(`New line count: ${fixedLines.length}`);
