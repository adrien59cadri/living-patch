/**
 * Compact JSON formatter that maintains readability while reducing size.
 * Breaks lines at logical points, keeping lines under ~180 characters.
 */

/**
 * Format JSON to be compact (180-char lines) while maintaining readability.
 */
export function compactJson(data, maxLineLength = 180) {
  try {
    return formatCompactObject(data, 0, maxLineLength);
  } catch (e) {
    // Fallback to minified if parsing fails
    return JSON.stringify(data);
  }
}

/**
 * Recursively format an object/array with smart line breaking
 */
function formatCompactObject(obj, depth = 0, maxLineLength = 180) {
  const indent = '  '.repeat(depth);

  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
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
function formatCompactArray(arr, depth, maxLineLength) {
  if (arr.length === 0) return '[]';

  // Check if this is a simple array (all primitives)
  const isSimpleArray = arr.every((item) => typeof item !== 'object' || item === null);

  if (isSimpleArray) {
    const compact = '[' + arr.map((item) => JSON.stringify(item)).join(', ') + ']';
    // If it fits on one line, keep it
    if (compact.length <= maxLineLength) {
      return compact;
    }
  }

  // Array of objects: keep each on its own line
  const indent = '  '.repeat(depth);
  const nextIndent = '  '.repeat(depth + 1);

  const items = arr.map((item) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const objStr = formatCompactObjectSingleLine(item, maxLineLength);
      return nextIndent + objStr;
    } else {
      return nextIndent + JSON.stringify(item);
    }
  });

  return '[\n' + items.join(',\n') + '\n' + indent + ']';
}

/**
 * Format an object literal compactly
 */
function formatCompactObjectLiteral(obj, depth, maxLineLength) {
  const indent = '  '.repeat(depth);
  const nextIndent = '  '.repeat(depth + 1);

  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  // Try to fit object on one line
  const singleLine = formatCompactObjectSingleLine(obj, maxLineLength);
  if (singleLine.length <= maxLineLength) {
    return singleLine;
  }

  // Otherwise, format with line breaks
  const lines = [];

  for (const [key, value] of entries) {
    let valueStr;

    if (value === null) {
      valueStr = 'null';
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        // Keep simple arrays inline
        if (value.every((v) => typeof v !== 'object')) {
          const arrStr = '[' + value.map((v) => JSON.stringify(v)).join(', ') + ']';
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

    const prefix = `${nextIndent}"${key}": `;
    const line = prefix + valueStr;

    if (line.length > maxLineLength && typeof value === 'object') {
      lines.push(`${nextIndent}"${key}": ${valueStr}`);
    } else {
      lines.push(line);
    }
  }

  return '{\n' + lines.join(',\n') + '\n' + indent + '}';
}

/**
 * Format an object as a single line (no nested breaking)
 */
function formatCompactObjectSingleLine(obj, maxLineLength) {
  const entries = Object.entries(obj).map(([key, value]) => {
    let valueStr;

    if (value === null) {
      valueStr = 'null';
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        valueStr = '[' + value.map((v) => JSON.stringify(v)).join(', ') + ']';
      } else {
        valueStr = formatCompactObjectSingleLine(value, maxLineLength);
      }
    } else {
      valueStr = JSON.stringify(value);
    }

    return `"${key}": ${valueStr}`;
  });

  return '{' + entries.join(', ') + '}';
}
