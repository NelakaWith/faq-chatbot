module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Relax line length rules (warn instead of error)
    "body-max-line-length": [1, "always", 200],
    "header-max-length": [1, "always", 200],
    // Allow sentence-case subjects (e.g. "chore: Refactor code structure...")
    "subject-case": [0, "never"],
    // Don't require a blank line before the body (some editors/edit flows omit it)
    "body-leading-blank": [0, "always"],
  },
};
