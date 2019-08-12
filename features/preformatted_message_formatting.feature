Feature: Preformatted message formatting
    As a user, I want to send some words or all message as preformatted

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
    Scenario: Only one word as preformatted
        And I type "```preformatted```"
        When I press the "Enter" keyboard button
        Then I should see "preformatted" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                  |
            | <pre class="c-mrkdwn__pre">preformatted</pre> |

    Scenario: Two words as preformatted
        And I type "```one two```"
        When I press the "Enter" keyboard button
        Then I should see "one two" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                             |
            | <pre class="c-mrkdwn__pre">one two</pre> |