/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import utilGlobals from '@illandril/foundryvtt-utils/tests/globals';
import deepmerge from 'deepmerge';
import localGlobals from './globals.js';

const globals = deepmerge(utilGlobals, localGlobals);

export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.[tj]s'],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['src/tests/', '\\.d\\.ts$'],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'babel',

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  // A set of global variables that need to be available in all test environments
  globals,

  moduleNameMapper: {
    '\\.scss$': '<rootDir>/src/tests/style.js',
  },

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: ['@illandril/foundryvtt-utils/tests/setup', './src/tests/setup.ts'],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['@illandril/foundryvtt-utils/tests/setupAfterEnv', './src/tests/setupAfterEnv.ts'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/(?!@illandril).+\\.js$'],
};
