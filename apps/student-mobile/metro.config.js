// pnpm-workspace Metro setup. Unlike Yarn/npm hoisted workspaces, pnpm keeps
// each package's dependencies in its own isolated node_modules linked via
// symlinks — so Metro needs symlink support (rather than custom
// nodeModulesPaths) plus visibility into the monorepo root to see workspace
// packages like @eduvantage/contracts.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
