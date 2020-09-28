export function getTitle(headers: string[]) {
  const title = headers.find((header) => /^title:/.test(header)) || "non title";
  return title.replace(/^title: /, "").replace(/^"/, "").replace(/"$/, "");
}

export function getEmoji(headers: string[]) {
  const emoji = headers.find((header) => /^emoji:/.test(header)) || "🈳";
  return emoji.replace(/^emoji: /, "").replace(/^"/, "").replace(/"$/, "");
}
