const { expect } = require("@jest/globals")
const testing = require("../testing")

test('adds 1 +2 to equal 3', () => {
    expect(testing(1,2)).toBe(3)
})