Feature: Quote message formatting
    As a user, I want to send some words or all message in quote

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
    Scenario: Only one word in quote
        And I type ">quote"
        When I press the "Enter" keyboard button
        Then I should see "quote" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                           |
            | <blockquote class="c-mrkdwn__quote">quote</blockquote> |
    
    Scenario: More than one word in quote
        And I type ">quote with more than one word"
        When I press the "Enter" keyboard button
        Then I should see "quote with more than one word" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                   |
            | <blockquote class="c-mrkdwn__quote">quote with more than one word</blockquote> |