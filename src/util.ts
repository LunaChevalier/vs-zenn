import * as yaml from "js-yaml";
import * as fs from 'fs';

export function getHeader(text: string): Header {
  const newLineHex = /\r\n|\n/;
  const separate = "---";
  const startIndex = text.split(newLineHex).indexOf(separate) + 1;
  const endIndex = text.split(newLineHex).indexOf(separate, startIndex);
  return yaml.safeLoad(text.split(newLineHex).slice(startIndex, endIndex).join('\n')) as Header;
}

export function isExistsPath(p: string): boolean {
  try {
    fs.accessSync(p);
  } catch (err) {
    return false;
  }

  return true;
}
