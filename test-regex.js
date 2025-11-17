const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

console.log(
  "Test 1 (with milliseconds):",
  regex.test("2025-11-17T10:00:00.000Z")
);
console.log(
  "Test 2 (without milliseconds):",
  regex.test("2025-11-17T10:00:00Z")
);
console.log("Test 3 (invalid):", regex.test("2025/11/17T10:00:00.000Z"));

// Also test Date parsing
console.log("\nDate parsing tests:");
console.log(
  "Date 1 valid:",
  !isNaN(new Date("2025-11-17T10:00:00.000Z").getTime())
);
console.log(
  "Date 2 valid:",
  !isNaN(new Date("2025-11-17T10:00:00Z").getTime())
);
