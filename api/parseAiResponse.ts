export function extractJson(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return text.trim();
}

export function getTextContent(
  content: Array<{ type: string; text?: string }>,
): string | null {
  const textBlock = content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text' || !textBlock.text) {
    return null;
  }
  return textBlock.text;
}
