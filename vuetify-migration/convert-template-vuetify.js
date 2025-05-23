import fs from "fs";
import { parse } from "node-html-parser";
import vueParser from "vue-parser";
import { deprecatedComponents, unifiedMappings } from "./migrationMap.js";
import inquirer from "inquirer";

const foundDeprecatedComponents = new Set();

function applyMapping(node, mapping) {
  console.log(node);
  const attrNames = Object.keys(node.attributes);

  for (const name of attrNames) {
    const value = node.getAttribute(name);

    if (name.startsWith("@") || name.startsWith("v-on:")) {
      const eventName = name.replace(/^@|^v-on:/, "");
      const newEvent = mapping[eventName];
      if (newEvent) {
        node.removeAttribute(name);
        node.setAttribute(`@${newEvent}`, value);
      }
      continue;
    }

    if (!(name in mapping)) {
      // **Handle case where name is a boolean attribute to convert to variant:**
      // Check if this attribute name is in any array of the mapping
      // For example: variant: ['outlined', 'filled', 'solo']

      let handled = false;

      for (const [mapKey, mapValue] of Object.entries(mapping)) {
        if (
          Array.isArray(mapValue) &&
          mapValue.includes(name) &&
          (value === "" || value === undefined)
        ) {
          // Remove old boolean attribute
          node.removeAttribute(name);
          // Add new attribute with key = mapKey, value = name
          node.setAttribute(mapKey, name);
          handled = true;
          break;
        }
      }

      if (handled) continue;

      // Not in mapping or array => skip
      continue;
    }

    // Existing logic for string or object
    const mapValue = mapping[name];

    if (typeof mapValue === "string") {
      node.removeAttribute(name);
      node.setAttribute(mapValue, value === "" ? "" : value);
    } else if (Array.isArray(mapValue)) {
      // Here you can keep or remove if you want, or skip
    } else if (typeof mapValue === "object") {
      if ("newAttr" in mapValue && "value" in mapValue) {
        node.removeAttribute(name);
        node.setAttribute(mapValue.newAttr, mapValue.value);
      } else {
        if (mapValue[value]) {
          node.removeAttribute(name);
          const { newAttr, value: newValue } = mapValue[value];
          node.setAttribute(newAttr, newValue);
        }
      }
    }
  }
}

function modifyProps(node) {
  console.log(node.nodeType);
  if (node.nodeType !== 1) return;

  const tag = node.rawTagName?.toLowerCase();
  if (!tag) return;

  // Component-specific mapping first: use .props of the component mapping
  const componentMapping = unifiedMappings.components?.[tag];
  if (componentMapping && componentMapping.props) {
    applyMapping(node, componentMapping.props);
  }

  // Then apply global attributes and events
  applyMapping(node, unifiedMappings.globalAttributes || {});
  applyMapping(node, unifiedMappings.globalEvents || {});
}

function walk(node) {
  if (node.nodeType !== 1) return;

  const originalTag = node.rawTagName?.toLowerCase();
  if (!originalTag) return;

  // Skip non-vuetify components but still recurse children
  if (!originalTag.startsWith("v-")) {
    node.childNodes.forEach(walk);
    return;
  }

  // Rename components if needed
  const renamed = unifiedMappings.renamedComponents?.[originalTag];
  if (renamed) {
    console.warn(`[RENAME] <${originalTag}> was renamed to <${renamed}>.`);
    node.rawTagName = renamed;
  }

  // Check for deprecated components
  const deprecationMessage = deprecatedComponents[originalTag];
  if (deprecationMessage) {
    foundDeprecatedComponents.add(originalTag);
    console.warn(`[DEPRECATED] ${deprecationMessage}`);
  }

  modifyProps(node);

  // Recurse into children
  node.childNodes.forEach(walk);
}

function fixSelfClosingVuetifyTags(templateStr) {
  // Regex to match self-closing tags starting with 'v-'
  const selfClosingTagRegex = /<(v-[\w-]+)([^>]*)\/>/gi;

  return templateStr.replace(selfClosingTagRegex, (match, tagName, attrs) => {
    return `<${tagName}${attrs}></${tagName}>`;
  });
}

async function convertTemplate() {
  const { inputPath } = await getInputPath();
  const { outputPath } = await getOutputPath();

  const vueFileContent = fs.readFileSync(inputPath, "utf-8");
  const parsed = vueParser.parse(vueFileContent, "template");

  const cleanedTemplate = fixSelfClosingVuetifyTags(parsed);

  // Parse template as HTML, keep rawTagName case sensitive (default)
  const root = parse(cleanedTemplate, {
    script: true,
    style: true,
    pre: true,
    comment: false,
  });

  // Walk and modify the parsed DOM
  let realRoot = root.childNodes[1];
  walk(realRoot);

  // Wrap back in <template> tags
  const newTemplate = `<template>\n${root.toString()}\n</template>`;

  fs.writeFileSync(outputPath, newTemplate, "utf-8");
  console.log("Transformation complete!");
}

async function getInputPath() {
  return await inquirer.prompt([
    {
      type: "input",
      name: "inputPath",
      message: "Enter the path to the vue file:",
      validate: (input) =>
        fs.existsSync(input) ? true : "File does not exist.",
    },
  ]);
}
async function getOutputPath() {
  return await inquirer.prompt([
    {
      type: "input",
      name: "outputPath",
      message: "Enter the output file path (e.g. utils/someUtil.js):",
    },
  ]);
}

export { convertTemplate };
