const fs = require("fs/promises");
const packageJson = require("package-json");
const chalk = require("chalk");
const stripAnsi = require("strip-ansi");

const pad = (n = 0) => " ".repeat(n);

/**
 *
 * @param {string[]} lines
 */
function renderBox(lines = [], color = chalk.green) {
  const maxLineLength = lines.reduce((max, line) => Math.max(max, stripAnsi(line).length), 0);

  const maxLength = maxLineLength + 2;

  const [tr, tl, br, bl, h, v] = [
    color("╗"),
    color("╔"),
    color("╝"),
    color("╚"),
    color("═"),
    color("║"),
  ];

  const border = h.repeat(maxLength);

  console.log(`
${tl}${border}${tr}
${lines
  .map((line) => {
    const [short, long] = [maxLength, stripAnsi(line).length].sort();

    const padding = long === short ? 0 : long - short - 2;

    return `${v} ${line}${pad(Math.max(padding, 0))} ${v}`;
  })
  .join("\n")}
${bl}${border}${br}
  `);
}

const PACKAGE_LOCK_FILES = ["yarn.lock", "package-lock.json", "pnpm-lock.yaml"];

/**
 * inferPackageManager - infer package manager
 * @returns {Promise<"yarn" | "npm" | "pnpm">}
 */
async function inferPackageManager() {
  const [hasYarnLock, hasPackageLock, hasPnpmLock] = await Promise.all(
    PACKAGE_LOCK_FILES.map((file) =>
      fs
        .readFile(file, "utf8")
        .then(Boolean)
        .catch(() => false)
    )
  );

  if (hasYarnLock) return "yarn";
  if (hasPackageLock) return "npm";
  if (hasPnpmLock) return "pnpm";

  return "npm";
}

async function main() {
  const { version, name } = await fs.readFile("./package.json", "utf-8").then(JSON.parse);

  // check for latest version on npm
  const { version: latest } = await packageJson(name, {
    version: "latest",
  });

  if (version == latest) {
    // nothing to see here
    return;
  }

  const releaseUrl = `https://github.com/axelarnetwork/axelarjs-sdk/releases/tag/v${latest}`;
  const changelogUrl = `https://github.com/axelarnetwork/axelarjs-sdk/blob/v${latest}/CHANGELOG.md`;

  const updateLine = chalk.bold(
    `📦 Update available! ${chalk.red(version)} → ${chalk.green(latest)}`
  );

  const AXELARJS_TAG = [
    "                     .__                 __",
    "_____  ___  ___ ____ |  | _____ _______ |__| ______",
    "\\__  \\ \\  \\/  // __ \\|  | \\__  \\\\_  __ \\|  |/  ___/",
    " / __ \\_>    <\\  ___/|  |__/ __ \\|  | \\/|  |\\___ \\",
    "(____  /__/\\_ \\\\___  >____(____  /__/\\__|  /____  >",
    "     \\/      \\/    \\/          \\/   \\______|    \\/",
  ];

  const packageManager = await inferPackageManager();

  const installCommands = {
    npm: `npm i ${name}@latest`,
    yarn: `yarn add ${name}@latest`,
    pnpm: `pnpm add ${name}@latest`,
  };

  renderBox(
    [
      ...AXELARJS_TAG.map((x) => chalk.bold.green(pad(9).concat(x))),
      "",
      `${pad(20)}${chalk.bold.yellow(name)}`,
      "",
      `${pad(16)}${updateLine}`,
      "",
      `${pad(6)}Run ${chalk.bgGray(installCommands[packageManager])} to update!`,
      "",
      "Find out more about this release:",
      "",
      `${chalk.cyan(changelogUrl)}`,
      `${chalk.cyan(releaseUrl)}`,
      "",
    ],
    chalk.bold.yellow
  );
}

main().catch(console.error);
