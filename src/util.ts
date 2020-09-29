export function getHeader(text: string) {
  const newLineHex = /\r\n|\n/;
  const separate = "---";
  const startIndex = text.split(newLineHex).indexOf(separate) + 1;
  const endIndex = text.split(newLineHex).indexOf(separate, startIndex);
  return text.split(newLineHex).slice(startIndex, endIndex).join('\n');
}