import * as yaml from "js-yaml";
import * as fs from 'fs';
import * as path from 'path';

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

export function getBookConfig(filepath: string): Header {
  return yaml.safeLoad(fs.readFileSync(filepath).toString()) as Header;
}

export function generateBookConfigFile(conf: Header) {
  return yaml.dump(conf);
}

export function getFileNameLatest(filepath: string): string {
  return fs.readdirSync(filepath).map(filename => {
    return {
      filename: filename,
      mtime: fs.statSync(path.join(filepath, filename)).mtime.getTime(),
    };
  }).sort((a, b) => b.mtime - a.mtime)[0].filename;
}