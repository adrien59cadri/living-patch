/**
 * Compact JSON formatter that maintains readability while reducing size.
 * Breaks lines at logical points, keeping lines under ~180 characters.
 */

/**
 * Format JSON to be compact (180-char lines) while maintaining readability.
 * Strategy:
 * - Keep metadata on one line
 * - Keep each species record on one line (usually fits ~180 chars)
 * - Keep descriptions as-is (don't break mid-paragraph)
 * - Break arrays of objects one per line
 */
export function compactJson(data: any, maxLineLength: number = 180): string {
  // Use single space after colons and commas to save space
  let json = JSON.stringify(data, null, 0).replace(/,/g, ", ");

  // Parse and re-format with intelligent line breaking
  try {
    const parsed = JSON.parse(json);
    return formatCompactObject(parsed, 0, maxLineLength);
  } catch {
    // Fallback to minified if parsing fails
    return JSON.stringify(data);
  }
}

/**
 * Recursively format an object/array with smart line breaking
 */
function formatCompactObject(
  obj: any,
  depth: number = 0,
  maxLineLength: number = 180
): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (obj === null) return "null";
  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return formatCompactArray(obj, depth, maxLineLength);
  }

  return formatCompactObjectLiteral(obj, depth, maxLineLength);
}

/**
 * Format an array compactly
 */
function formatCompactArray(arr: any[], depth: number, maxLineLength: number): string {
  if (arr.length === 0) return "[]";

  // Check if this is a simple array (all primitives)
  const isSimpleArray = arr.every((item) => typeof item !== "object" || item === null);

  if (isSimpleArray) {
    const compact = "[" + arr.map((item) => JSON.stringify(item)).join(", ") + "]";
    // If it fits on one line, keep it
    if (compact.length <= maxLineLength) {
      return compact;
    }
  }

  // Array of objects: keep each on its own line
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  const items = arr.map((item) => {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      // Format object on single line if it fits
      const objStr = formatCompactObjectSingleLine(item, maxLineLength);
      return nextIndent + objStr;
    } else {
      return nextIndent + JSON.stringify(item);
    }
  });

  return "[\n" + items.join(",\n") + "\n" + indent + "]";
}

/**
 * Format an object literal compactly
 */
function formatCompactObjectLiteral(
  obj: Record<string, any>,
  depth: number,
  maxLineLength: number
): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  const entries = Object.entries(obj);
  if (entries.length === 0) return "{}";

  // Try to fit object on one line
  const singleLine = formatCompactObjectSingleLine(obj, maxLineLength);
  if (singleLine.length <= maxLineLength) {
    return singleLine;
  }

  // Otherwise, format with line breaks
  const lines: string[] = [];

  for (const [key, value] of entries) {
    let valueStr: string;

    if (value === null) {
      valueStr = "null";
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        // Keep simple arrays inline
        if (value.every((v) => typeof v !== "object")) {
          const arrStr = "[" + value.map((v) => JSON.stringify(v)).join(", ") + "]";
          if (arrStr.length < 100) {
            valueStr = arrStr;
          } else {
            valueStr = formatCompactArray(value, depth + 1, maxLineLength);
          }
        } else {
          valueStr = formatCompactArray(value, depth + 1, maxLineLength);
        }
      } else {
        valueStr = formatCompactObject(value, depth + 1, maxLineLength);
      }
    } else {
      valueStr = JSON.stringify(value);
    }

    // Format the key-value pair
    const prefix = `${nextIndent}"${key}": `;
    const line = prefix + valueStr;

    // If line is too long and value is an object, put the value on next line(s)
    if (line.length > maxLineLength && typeof value === "object") {
      lines.push(prefix.slice(0, -2)); // Remove trailing ": "
      lines[lines.length - 1] += ': ' + valueStr;
    } else {
      lines.push(line);
    }
  }

  return "{\n" + lines.join(",\n") + "\n" + indent + "}";
}

/**
 * Format an object as a single line (no nested breaking)
 */
function formatCompactObjectSingleLine(obj: Record<string, any>, maxLineLength: number): string {
  const entries = Object.entries(obj).map(([key, value]) => {
    let valueStr: string;

    if (value === null) {
      valueStr = "null";
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        // Format simple arrays inline
        valueStr = "[" + value.map((v) => JSON.stringify(v)).join(", ") + "]";
      } else {
        // Recursively format nested objects on one line
        valueStr = formatCompactObjectSingleLine(value, maxLineLength);
      }
    } else {
      valueStr = JSON.stringify(value);
    }

    return `"${key}": ${valueStr}`;
  });

  return "{" + entries.join(", ") + "}";
}
