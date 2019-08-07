Feature: Bold message formatting
    As a user, I want to send some words or all message in bold

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |
    
    Scenario: Only one word in bold
        And I type "*bold*"
        When I press the "Enter" keyboard button
        Then I should see "bold" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | <b>bold</b>  |
