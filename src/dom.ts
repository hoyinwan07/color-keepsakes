/** Find an element that must exist; fails loudly if the markup and code drift apart. */
export function $<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}
