name: "📖 Documentation"
description: Report a documentation issue or suggest an improvement
labels: ["documentation", "pending triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thank you for helping us improve the documentation!
        Please check the [documentation](https://comark.dev/) before submitting.
  - type: dropdown
    id: type
    attributes:
      label: Type
      options:
        - Typo or grammar
        - Incorrect information
        - Missing documentation
        - Unclear explanation
        - Other
    validations:
      required: true
  - type: input
    id: page
    attributes:
      label: Page URL or section
      description: Link to the page or name of the section with the issue.
      placeholder: https://comark.dev/getting-started/introduction
  - type: textarea
    id: description
    attributes:
      label: Description
      description: A clear description of the documentation issue or suggested improvement.
    validations:
      required: true
  - type: textarea
    id: suggested-change
    attributes:
      label: Suggested change
      description: If you have a specific change in mind, describe it here.
  - type: textarea
    id: additional
    attributes:
      label: Additional context
      description: If applicable, add any other context or screenshots here.
