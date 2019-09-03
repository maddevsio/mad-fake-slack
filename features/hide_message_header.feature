Feature: Hide header for sequence of messages from one user
    As a user, I don't want to see header for each one by one messages from me

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Display header for first message from sequence
        And I type "first message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When I type "second message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | <not exists>   |
            | Message body   | second message |

    Scenario: Display header for message sequence between bot and client one by one
        And I type "first message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When User "Valera" send message:
            | type    | message           |
            | text    | first bot message |
            | channel | general           |
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera            |
            | App badge      | APP               |
            | Message body   | first bot message |