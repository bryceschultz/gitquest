/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    'buildConfig$': '<rootDir>/tests/__mocks__/configMock.cjs',
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/__mocks__/styleMock.cjs",
  },
};
