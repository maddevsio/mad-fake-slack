Feature: Italic message formatting
    As a user, I want to send some words or all message in italic format

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page

    Scenario: Only one word in italic
        And I type "_italic_"
        When I press the "Enter" keyboard button
        Then I should see "italic" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content  |
            | <i>italic</i> |