#!/usr/bin/env node
import { printInteractiveNotice } from "./copyRightInfo.js";
import inquirer from "inquirer";
import { convertMixin } from "./convert-mixin-utils.js";

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
        { name: "Modify Filters to Functions", value: "convertFilters" },
        // Future options can go here
      ],
    },
  ]);

  if (tool === "convertMixin") {
    convertMixin();
  }
}

main();
