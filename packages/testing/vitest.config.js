// Shared Vitest defaults. Import and spread/extend this from a package's own
// vitest.config.ts rather than duplicating options everywhere.
export const baseVitestConfig = {
  test: {
    environment: "node",
    restoreMocks: true,
  },
};
