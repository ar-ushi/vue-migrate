import { printInteractiveNotice } from "./copyRightInfo.js";
import inquirer from "inquirer";
import { convertMixin } from "./convert-mixin-utils.js";
import { convertTemplate } from "./vuetify-migration/convert-template-vuetify.js";

async function main() {
  if (process.stdout.isTTY) {
    printInteractiveNotice();
  }

  const { tool } = await inquirer.prompt([
    {
      type: "list",
      name: "tool",
      message: "What would you like to do?",
      choices: [
        { name: "Convert Vue 2 Mixin to JS Util", value: "convertMixin" },
        {
          name: "Modify Vue 2 Template to Vue 3 Template (Vueitfy-based)",
          value: "convertTemplate",
        },
        // Future options can go here
      ],
    },
  ]);
  switch (tool) {
    case "convertMixin":
      convertMixin();
      break;
    case "convertTemplate":
      convertTemplate();
      break;
  }
}

main();
