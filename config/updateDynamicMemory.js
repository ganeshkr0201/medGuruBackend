import { User } from "../models/user.js";

const updateDynamicMemory = (originalContent, updatedString) => {
    // Convert strings into key-value maps
    const originalLines = originalContent.split('\n').filter(Boolean);
    const updateLines = updatedString.split('\n').filter(Boolean);

    const originalMap = new Map();
    originalLines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
            originalMap.set(key.trim(), rest.join(':').trim());
        }
    });

    // Apply updates
    updateLines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
            originalMap.set(key.trim(), rest.join(':').trim());
        }
    });

    // Convert back to newline-separated string
    const updatedContent = Array.from(originalMap.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    return updatedContent;
};


  export {
    updateDynamicMemory,
  }
