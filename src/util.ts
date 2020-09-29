export function getTitle(headers: string[]) {
  const title = headers.find((header) => /^title:/.test(header)) || "non title";
  return title.replace(/^title: /, "").replace(/^"/, "").replace(/"$/, "");
}

export function getEmoji(headers: string[]) {
  const emoji = headers.find((header) => /^emoji:/.test(header)) || "🈳";
  return emoji.replace(/^emoji: /, "").replace(/^"/, "").replace(/"$/, "");
}

export function getHeader(text: string) {
  const newLineHex = /\r\n|\n/;
  const separate = "---";
  const startIndex = text.split(newLineHex).indexOf(separate) + 1;
  const endIndex = text.split(newLineHex).indexOf(separate, startIndex);
  return text.split(newLineHex).slice(startIndex, endIndex).join('\n');
}