Feature: Code message formatting
    As a user, I want to send some words or all message in code

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page

    Scenario: Only one word in code
        And I type "`code`"
        When I press the "Enter" keyboard button
        Then I should see "code" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                             |
            | <code class="c-mrkdwn__code">code</code> |