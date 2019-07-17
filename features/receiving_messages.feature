Feature: Receiving messages
    As a user, I want to receive messages from different channels

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |
    
    Scenario: Reciving "typing" status message in the "general" channel
        When User "Valera" send "user_typing" message to "general" channel
        Then I should see "Valera is typing" in "Notification bar item"
    
    Scenario: Reciving "typing" status message in the "random" channel
        And I click on "channel item" with text "random"
        When User "Valera" send "user_typing" message to "random" channel
        Then I should see "Valera is typing" in "Notification bar item"
    
    Scenario: Receiving simple text message from "general" channel
        When User "Valera" send message:
            | type    | message          |
            | text    | Text from bot #1 |
            | channel | general          |
        Then I should see "last" message with:
            | Message sender | Valera           |
            | App badge      | APP              |
            | Message body   | Text from bot #1 |

    Scenario: Receiving simple text message from "random" channel
        And I click on "channel item" with text "random"
        When User "Valera" send message:
            | type    | message          |
            | text    | Text from bot #2 |
            | channel | random           |
        Then I should see "last" message with:
            | Message sender | Valera           |
            | App badge      | APP              |
            | Message body   | Text from bot #2 |