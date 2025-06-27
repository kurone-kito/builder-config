# 📄 PNPM project template

## Features

- PNPM
- TypeScript
- Biome
- Commitlint with Husky
- Visual Studio Code / Vim ready
- CI configurations
  - CodeRabbit
  - Dependabot
  - GitHub Actions

## How to use this template

You can create a new project by using `degit` or the “Use this template”
button on GitHub.

```sh
npx degit kurone-kito/pnpm-project-template my-project
cd my-project
pnpm install
```

### Additional configurations

- Update `package.json` fields:
  - `name`: The name of your project.
  - `description`: A brief description of your project.
  - `author`: Your name or organization.
  - `license`: The license for your project (default is MIT).
  - `homepage`: The homepage URL for your project.
  - `repository`: The repository URL for your project.
  - `bugs`: The URL for reporting issues.
- Edit or remove `.github/CODEOWNERS` as needed.

### Usecase

When you want to create a monorepo project, you should use the
[pnpm-workspace-template](https://github.com/kurone-kito/pnpm-workspace-template).

## System Requirements

- Node.js: Any of the following versions
  - Iron LTS (`^20.11.x`)
  - Jod LTS (`^22.x.x`)
  - Latest (`>=24.x.x`)

Note that this template includes `.node-version`, `.nvmrc`, and
`.tool-versions` files with specific Node.js versions. These files
currently list `20.19.3`, so update them and this section as needed when
you start a new project.

## Development

### Install the dependencies

```sh
corepack enable
pnpm install
```

### Building

```sh
pnpm run build
```

### Linting

```sh
pnpm run lint
pnpm run lint:fix # Lint and auto-fix
```

### Testing

```sh
pnpm run test
```

Currently, the command works as an alias for the `pnpm run lint` command.
Set up your own testing framework and replace this script as needed.

### Cleaning

```sh
pnpm run clean
```

## Contributing

Welcome to contribute to this repository! For more details,
please refer to [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## LICENSE

[MIT](./LICENSE)
