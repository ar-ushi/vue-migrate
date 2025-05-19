import inquirer from "inquirer";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import fs from "fs";
const exportables = [];

async function convertMixin() {
  const propertyNames = await extractPropertyNames();
  const { mixinPathInput } = await getInputPath();
  const { outputPath } = await getOutputPath();

  const ast = parseMixinFile(mixinPathInput);
  const outputCode = extractProperties(ast, propertyNames);
  fs.writeFileSync(outputPath, outputCode, "utf-8");
}

async function extractPropertyNames() {
  const defaults = { data: "data", methods: "methods" };
  const result = {};

  for (const propType of ["data", "methods"]) {
    const { actualName } = await inquirer.prompt([
      {
        type: "input",
        name: "actualName",
        message: `Enter actual property name for "${propType}" (default: "${propType}"):`,
      },
    ]);
    result[propType] = actualName.trim() || defaults[propType];
  }

  return result;
}

async function getInputPath() {
  return await inquirer.prompt([
    {
      type: "input",
      name: "mixinPathInput",
      message: "Enter the path to the mixin file:",
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

function parseMixinFile(inputPath) {
  const fileContent = fs.readFileSync(inputPath, "utf-8");
  return parser.parse(fileContent, {
    sourceType: "module",
    plugins: ["objectRestSpread"],
  });
}

function extractProperties(ast, propertyNames) {
  traverse.default(ast, {
    ExportDefaultDeclaration(path) {
      extractMethods(path.node.declaration, propertyNames.methods);
      extractDataProperties(path.node.declaration, propertyNames.data);
      path.stop();
    },
  });
  const exportObj = [];
  const outputFunctions = exportables
    .map((node) => {
      if (node.type === "FunctionDeclaration") {
        exportObj.push(node.id.name);
        return generate.default(node).code;
      }

      if (node.type === "VariableDeclaration") {
        node.declarations.forEach((decl) => {
          if (decl.id && decl.id.name) exportObj.push(decl.id.name);
        });
        return generate.default(node).code;
      }

      if (node.type === "Property" && node.key && node.valueCode) {
        exportObj.push(node.key);
        return generate.default({
          type: "ObjectProperty",
          key: { type: "Identifier", name: node.key },
          computed: false,
          shorthand: false,
          value: node.valueCode,
        }).code;
      }

      return "";
    })
    .join("\n\n");
  const exportStatement = `export { ${exportObj.join(", ")} };`;
  return outputFunctions + "\n\n" + exportStatement;
}

function extractMethods(exportNode, propName) {
  const methodProp = exportNode.properties.find(
    (prop) => prop.key.name === propName
  );

  if (!methodProp) {
    return null;
  }

  methodProp.value.properties.forEach((method) => {
    let funcNode;

    if (method.type === "ObjectMethod") {
      funcNode = {
        type: "FunctionDeclaration",
        id: method.key,
        params: method.params,
        body: method.body,
        generator: method.generator,
        async: method.async,
      };
    }

    if (funcNode) {
      exportables.push(funcNode);
    }
  });
}

function extractDataProperties(exportNode, propName) {
  const dataProp = exportNode.properties.find(
    (prop) => prop.key && prop.key.name === "data"
  );

  if (!dataProp) {
    return null;
  }

  const returnStatement = dataProp.body.body.find(
    (stmt) => stmt.type === "ReturnStatement"
  );
  if (
    !returnStatement ||
    returnStatement.argument.type !== "ObjectExpression"
  ) {
    return null;
  }

  const properties = returnStatement.argument.properties;

  properties.forEach((prop) => {
    if (prop.type === "ObjectProperty") {
      exportables.push({
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: { type: "Identifier", name: prop.key.name || prop.key.value },
            init: prop.value,
          },
        ],
      });
    } else if (prop.type === "ObjectMethod") {
      exportables.push({
        type: "FunctionDeclaration",
        id: prop.key,
        params: prop.params,
        body: prop.body,
        generator: prop.generator,
        async: prop.async,
      });
    }
  });
}

//using AST (Abstract Syntax Tree)

export { convertMixin };
