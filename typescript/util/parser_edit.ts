import Parser from "npm:tree-sitter@^0.22.4";

export function makeEdit(oldText: string, newText: string): Parser.Edit {
  const encoder = new TextEncoder();
  const oldByte = encoder.encode(oldText);
  const newByte = encoder.encode(newText);

  const [start, end] = findDifferenceBounds(oldByte, newByte);

  const startCharIndex = byteIndexToCharIndex(oldText, start);
  const oldEndCharIndex = byteIndexToCharIndex(oldText, oldByte.length - end);
  const newEndCharIndex = byteIndexToCharIndex(newText, newByte.length - end);

  return {
    startIndex: start,
    oldEndIndex: oldByte.length - end,
    newEndIndex: newByte.length - end,
    startPosition: findStrPoint(oldText, startCharIndex),
    oldEndPosition: findStrPoint(oldText, oldEndCharIndex),
    newEndPosition: findStrPoint(newText, newEndCharIndex),
  };
}

function findDifferenceBounds(oldByte: Uint8Array, newByte: Uint8Array): [number, number] {
  const minLength = Math.min(oldByte.length, newByte.length);
  let start = 0;
  let end = 0;

  while (start < minLength && oldByte[start] === newByte[start]) {
    start++;
  }

  while (end < minLength - start && oldByte[oldByte.length - end - 1] === newByte[newByte.length - end - 1]) {
    end++;
  }

  return [start, end];
}

function byteIndexToCharIndex(text: string, byteIndex: number): number {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);
  let charIndex = 0;

  for (let i = 0; i < byteIndex; i++) {
    // byte in the middle of a UTF-8 character is in the range of 0x80-0xBF
    if ((encodedText[i] & 0xC0) !== 0x80) {
      charIndex++;
    }
  }

  return charIndex;
}


function findStrPoint(text: string, charIndex: number): Parser.Point {
  let row = 0;
  let column = 0;

  for (let i = 0; i < text.length && i < charIndex; i++) {
    if (text[i] === '\n') {
      row++;
      column = 0;
    } else {
      column++;
    }
  }

  return { row, column };
}
