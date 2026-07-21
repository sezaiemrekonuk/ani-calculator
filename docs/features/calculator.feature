Feature: Calculate a mathematical formula
  As an API consumer
  I want to send a mathematical formula
  So that I get its calculated result back

  Supports the four basic operations with operator precedence.
  Parentheses can group sub-expressions and override the default
  evaluation order; nesting and multiple independent pairs are
  supported. Operands and results are integers; negative results
  are allowed. The response contains the result, the original
  formula, and a formatted expression of both.

  Scenario: Add two numbers
    When the formula "2 + 3" is calculated
    Then the result is 5
    And the formula in the response is "2 + 3"
    And the formatted expression is "2 + 3 = 5"

  Scenario: Subtract two numbers
    When the formula "10 - 4" is calculated
    Then the result is 6
    And the formatted expression is "10 - 4 = 6"

  Scenario: Multiply two numbers
    When the formula "6 * 7" is calculated
    Then the result is 42
    And the formatted expression is "6 * 7 = 42"

  Scenario: Divide two numbers
    When the formula "20 / 5" is calculated
    Then the result is 4
    And the formatted expression is "20 / 5 = 4"

  Scenario: Respect operator precedence
    When the formula "2 + 3 * 4" is calculated
    Then the result is 14
    And the formatted expression is "2 + 3 * 4 = 14"

  Scenario: Combine several operations with precedence
    When the formula "10 - 6 / 2 + 4 * 3" is calculated
    Then the result is 19
    And the formatted expression is "10 - 6 / 2 + 4 * 3 = 19"

  Scenario: A negative result is allowed
    When the formula "3 - 5" is calculated
    Then the result is -2
    And the formatted expression is "3 - 5 = -2"

  Scenario: Division that does not divide evenly is rejected
    When the formula "7 / 2" is calculated
    Then the request is rejected
    And the error message is "The result must be an integer: 7 / 2"

  Scenario: Divide by zero is rejected
    When the formula "5 / 0" is calculated
    Then the request is rejected
    And the error message is "Division by zero is not allowed: 5 / 0"

  Scenario: An invalid formula is rejected
    When the formula "2 + * 3" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 2 + * 3"

  Scenario: An empty formula is rejected
    When the formula "" is calculated
    Then the request is rejected
    And the error message is "The formula must not be empty"

  # --- Parenthesis support ---

  Scenario: Parentheses override operator precedence
    When the formula "(2 + 3) * 4" is calculated
    Then the result is 20
    And the formula in the response is "(2 + 3) * 4"
    And the formatted expression is "(2 + 3) * 4 = 20"

  Scenario: Parentheses with no effect produce the same result
    When the formula "(6 * 7)" is calculated
    Then the result is 42
    And the formatted expression is "(6 * 7) = 42"

  Scenario: Parentheses on the right-hand side of a subtraction
    When the formula "10 - (3 + 2)" is calculated
    Then the result is 5
    And the formatted expression is "10 - (3 + 2) = 5"

  Scenario: Two independent pairs of parentheses
    When the formula "(2 + 3) * (4 - 1)" is calculated
    Then the result is 15
    And the formatted expression is "(2 + 3) * (4 - 1) = 15"

  Scenario: Nested parentheses
    When the formula "2 * (3 + (4 - 1))" is calculated
    Then the result is 12
    And the formatted expression is "2 * (3 + (4 - 1)) = 12"

  Scenario: Deeply nested parentheses
    When the formula "((2 + 3) * (10 - (2 + 3)))" is calculated
    Then the result is 25
    And the formatted expression is "((2 + 3) * (10 - (2 + 3))) = 25"

  Scenario: Parentheses combined with operator precedence outside them
    When the formula "2 + (3 * 4) - 1" is calculated
    Then the result is 13
    And the formatted expression is "2 + (3 * 4) - 1 = 13"

  Scenario: Unmatched opening parenthesis is rejected
    When the formula "(2 + 3" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: (2 + 3"

  Scenario: Unmatched closing parenthesis is rejected
    When the formula "2 + 3)" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 2 + 3)"

  Scenario: Empty parentheses are rejected
    When the formula "2 + () + 3" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 2 + () + 3"

  Scenario: Division inside parentheses that does not divide evenly is rejected
    When the formula "(7 / 2) + 1" is calculated
    Then the request is rejected
    And the error message is "The result must be an integer: 7 / 2"

