import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromFile = async (filePath, fileType) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf' || fileType?.includes('pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    } else if (ext === '.docx' || fileType?.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } else if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    } else {
      // Basic buffer read as fallback
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer.toString('utf-8', 0, Math.min(dataBuffer.length, 50000));
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error.message);
    return '';
  }
};

export default {
  extractTextFromFile
};
