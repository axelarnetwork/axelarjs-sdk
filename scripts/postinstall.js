const fs = require("fs/promises");
const packageJson = require("package-json");
const chalk = require("chalk");

const pad = (n = 0) => " ".repeat(n);

async function main() {
  const { version, name } = await fs.readFile("./package.json", "utf-8").then(JSON.parse);

  // check for latest version on npm
  const { version: latest } = await packageJson(name, {
    version: "latest",
  });

  if (version !== latest) {
    const maxLength = 73;

    const [tr, tl, br, bl, h, v] = [
      chalk.green("╗"),
      chalk.green("╔"),
      chalk.green("╝"),
      chalk.green("╚"),
      chalk.green("═"),
      chalk.green("║"),
    ];
    const border = h.repeat(maxLength);

    const releaseUrl = `https://github.com/axelarnetwork/axelarjs-sdk/releases/tag/v${latest}`;
    const changelogUrl = `https://github.com/axelarnetwork/axelarjs-sdk/blob/v${latest}/CHANGELOG.md`;

    const updateLine = chalk.bold(
      `📦 Update available! ${chalk.red(version)} → ${chalk.green(latest)}`
    );

    const line = `${" ".repeat(maxLength - 1)}${v}`;

    const AXELARJS_TAG = `${line}
║${pad(8)}                     .__                 __                  ${pad(4)}║
║${pad(8)}_____  ___  ___ ____ |  | _____ _______ |__| ______          ${pad(4)}║
║${pad(8)}\\__  \\ \\  \\/  // __ \\|  | \\__  \\\\_  __ \\|  |/  ___/ ${pad(13)}║
║${pad(8)} / __ \\_>    <\\  ___/|  |__/ __ \\|  | \\/|  |\\___ \\     ${pad(10)}║
║${pad(8)}(____  /__/\\_ \\\\___  >____(____  /__/\\__|  /____  >      ${pad(8)}║
║${pad(8)}     \\/      \\/    \\/          \\/   \\______|    \\/     ${pad(10)}║`;

    console.log(`
${tl}${border}${tr}
${v} ${chalk.bold(chalk.green(AXELARJS_TAG))}
${v} ${line}
${v} ${chalk.bold(`${pad(18)}${name}`)}${pad(26)}${v}
${v} ${line}
${v} ${pad(14)}${updateLine}${pad(22)}${v}
${v} ${line}
${v} ${line}
${v} Check out the latest release at: ${pad(39)}${v}
${v} ${line}
${v} ${chalk.cyan(changelogUrl)} ${v}
${v} ${chalk.cyan(releaseUrl)}${pad(6)}${v}
${v} ${line}
${bl}${border}${br}
\n`);
  }
}

main().catch(console.error);
