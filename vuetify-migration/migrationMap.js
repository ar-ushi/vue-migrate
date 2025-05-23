const unifiedMappings = {
  globalAttributes: {
    value: "model-value",
    variant: ["outlined", "filled", "solo"],
    "append-inner": "append",
    append: "append-outer",
    "item-text": "item-title",
    location: ["top", "bottom", "left", "right"],
    "background-color": "bg-color",
    position: ["absolute", "fixed"],
    "validate-on-blur": {
      newAttr: "validate-on",
      value: "blur",
    },
    dense: {
      newAttr: "density",
      value: "compact",
    },
  },
  globalEvents: {
    input: "update:modelValue",
    change: "update:modelValue",
  },
  components: {
    "v-alert": {
      props: {
        "border-color": "colored-border",
        closable: "dismissable",
        variant: ["outlined", "text"],
      },
    },
    "v-badge": {
      props: {
        "": ["overlap", "mode", "origin", "avatar"],
      },
    },
    "v-banner": {
      props: {
        "": ["shaped", "icon-color"],
        "single-line": { newAttr: "lines", value: "one" },
      },
    },

    "v-btn": {
      props: {
        "active-class": ["selected-class"],
        variant: ["flat", "outlined", "text", "plain"],
        depressed: { newAttr: "variant", value: "flat" },
      },
    },
    "v-btn-toggle": {
      props: {
        "active-class": ["selected-class"],
        variant: ["flat", "outlined", "text", "plain"],
        depressed: { newAttr: "variant", value: "flat" },
      },
    },
    "v-checkbox": {
      props: {
        "model-value": "input-value",
        "true-icon": "on-icon",
        "false-icon": "off-icon",
        "true-value": "on-value",
        "false-value": "off-value",
      },
    },
    "v-radio": {
      props: {
        "model-value": "input-value",
        "true-icon": "on-icon",
        "false-icon": "off-icon",
        "true-value": "on-value",
        "false-value": "off-value",
      },
    },
    "v-switch": {
      props: {
        "model-value": "input-value",
        "true-icon": "on-icon",
        "false-icon": "off-icon",
        "true-value": "on-value",
        "false-value": "off-value",
      },
    },
    "v-list": {
      props: {
        "two-line": { newAttr: "lines", value: "two" },
        "three-line": { newAttr: "lines", value: "three" },
      },
    },
    "v-list-item": {
      props: {
        active: "input-value",
      },
    },
    "v-menu": {
      props: {
        "": ["rounded", "absolute", "offset-y", "offset-x"],
      },
    },
    "v-tooltip": {
      props: {
        "": ["rounded", "absolute", "offset-y", "offset-x"],
      },
    },
  },
  renamedComponents: {
    "v-subheader": "v-list-subheader",
    "v-expansion-panel-header": "v-expansion-panel-title",
    "v-expansion-panel-content": "v-expansion-panel-text",
  },
};

const deprecatedComponents = {
  "v-list-item-group":
    "Assign the item’s key to the value prop of each v-list-item and bind v-model:selected on the v-list to get the selected value.",
  "v-list-item-icon":
    "Use v-list-item with icon or avatar props, or put an icon or avatar in the append or prepend slot.",
  "v-list-item-avatar":
    "Use v-list-item with icon or avatar props, or put an icon or avatar in the append or prepend slot.",
  "v-list-item-content": "Lists use CSS grid for layout now instead.",
};

export { deprecatedComponents, unifiedMappings };
