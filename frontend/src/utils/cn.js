// src/utils/cn.js
// Utility function for conditional class concatenation

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
