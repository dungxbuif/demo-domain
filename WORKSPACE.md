# Workspace Package Management

This is a Yarn workspace setup. You can now install packages from the root directory.

## Installing Packages

### From the root directory:

#### Install for web app:

```bash
# Install production dependency for web app
yarn workspace web add <package-name>

# Install dev dependency for web app
yarn workspace web add -D <package-name>

# Or use the shortcut
npm run install:web <package-name>
```

#### Install for backend app:

```bash
# Install production dependency for backend app
yarn workspace qn-official-api add <package-name>

# Install dev dependency for backend app
yarn workspace qn-official-api add -D <package-name>

# Or use the shortcut
npm run install:be <package-name>
```

#### Install shared dependencies (root level):

```bash
# Install production dependency at workspace root
yarn add -W <package-name>
# Or use shortcut
npm run install:prod <package-name>

# Install dev dependency at workspace root
yarn add -D -W <package-name>
# Or use shortcut
npm run install:dev <package-name>
```

### General commands:

```bash
# Install all dependencies
yarn install

# Clean install
yarn install --frozen-lockfile

# Update dependencies
yarn upgrade

# View workspace info
yarn workspaces info
```

## Examples:

```bash
# Install React Query for web app
yarn workspace web add @tanstack/react-query

# Install TypeScript types for backend
yarn workspace qn-official-api add -D @types/node

# Install Nx plugin at root
yarn add -D -W @nx/react
```
