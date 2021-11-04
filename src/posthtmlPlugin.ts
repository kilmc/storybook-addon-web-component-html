import { Node, Plugin } from "posthtml";

export default (options: {
  stringAttrs: string[];
  safeAttrs: string[];
}): Plugin<unknown> => {
  function PLUGIN_NAME_CAMEL(tree: Node): Node {
    tree.match({ tag: /button/ }, (node) => {
      // Delete innerHTML
      const hasContent = node.attrs && node.attrs["content"] !== "";

      node.content = hasContent
        ? [node.attrs && (node.attrs["content"] as string)]
        : [""];

      const filterEmptyStringSafeAttrs = ([attr, value]: [string, any]) =>
        options.stringAttrs.includes(attr) && value === "";
      const filterSafeAttrs = ([attr]: [string, any]) =>
        !options.safeAttrs.includes(attr);

      const attrsForDeletion = Object.entries(node.attrs as {}).filter(
        (entry: [string, any]) => {
          return filterSafeAttrs(entry) || filterEmptyStringSafeAttrs(entry);
        }
      );

      attrsForDeletion.forEach(([attr]) => {
        Reflect.deleteProperty(node.attrs as {}, attr);
      });

      return node;
    });
    // Your plugin
    return tree;
  }

  return PLUGIN_NAME_CAMEL;
};
