# eslint-plugin-afl

[![npm version](https://img.shields.io/npm/v/eslint-plugin-afl.svg)](https://www.npmjs.com/package/eslint-plugin-afl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An [ESLint](https://eslint.org/) plugin providing linting rules and a parser for [AmiBroker Formula Language (AFL)](https://www.amibroker.com/guide/afl/), helping you write cleaner, more consistent AFL code.

---

## Features

- **Custom ESLint parser for AFL**
- **Rule: `afl/space-inside-parens`** — Enforces a space after `(` and before `)` in function calls
- Easy integration with ESLint for `.afl` files

---

## Installation

```sh
npm install --save-dev eslint-plugin-afl
```

> **Peer dependency:** Requires ESLint v8+ and Node.js v14+.

---

## Usage

1. **Add to ESLint config** (e.g., `eslint.config.js`):

Add `eslint.config.js`

```js
import { defineConfig } from "eslint/config";
import afl from "eslint-plugin-afl";

export default defineConfig([
    {
        name: "eslint-plugin-afl",
        files: ["**/*.afl", "*.afl"],
        languageOptions: {
            parser: afl.parser,
        },
        plugins: {
            afl,
        },
        rules: {
            "afl/space-inside-parens": "warn",
        },
    },
]);
```

Add vscode eslint setting

```json
  "eslint.validate": [
        "afl"
  ]
```

1. **Lint your AFL files:**

```sh
eslint path/to/your/file.afl
```

---

## Provided Rules

### `afl/space-inside-parens`

> Require a space after `(` and before `)` in AFL function calls.

**Incorrect:**

```afl
SetOption("InitialEquity",initialEquity);
```

**Correct:**

```afl
SetOption( "InitialEquity", initialEquity );
```

- **Type:** Layout
- **Fixable:** Yes (autofix supported)

---

## Example

Given the following AFL code:

```afl
SetOption("InitialEquity",initialEquity);
SetOption( "MaxOpenPositions",maxPosition );
```

Running ESLint with this plugin will report and (with `--fix`) correct the first line:

```afl
SetOption( "InitialEquity", initialEquity );
SetOption( "MaxOpenPositions", maxPosition );
```

---

## Contributing

Contributions, issues, and feature requests are welcome! Please open an issue or pull request.

---

## License

MIT
