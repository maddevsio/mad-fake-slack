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

    Scenario: Two words in code
        And I type "`some code`"
        When I press the "Enter" keyboard button
        Then I should see "some code" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                  |
            | <code class="c-mrkdwn__code">some code</code> |
    
    Scenario: Two code blocks one by one
        And I type "`code1` `code2`"
        When I press the "Enter" keyboard button
        Then I should see "code1 code2" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                        |
            | <code class="c-mrkdwn__code">code1</code> <code class="c-mrkdwn__code">code2</code> |

    Scenario: Include any count of ` from the end
        And I type "`code1````"
        When I press the "Enter" keyboard button
        Then I should see "code1```" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                 |
            | <code class="c-mrkdwn__code">code1```</code> |