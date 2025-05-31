const nextJest = require('next/jest')

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({
  dir: './',
})

// Any custom config you want to pass to Jest
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: if you have setup tasks
  moduleNameMapper: {
    // Example: Handle module aliases (if you configure them in tsconfig.json)
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
  },
  // Indicates that all .js, .jsx, .ts, .tsx files should be transformed by Babel
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}

module.exports = createJestConfig(customJestConfig)
