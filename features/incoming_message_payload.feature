Feature: Incoming message payload
    As a user, I want to be sure that 
    payload of incoming message is correct

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |
    
    Scenario: Check incoming message payload from "general" channel
        And I type "general text message"
        When I press the "Enter" keyboard button
        Then I should see "general text message" in "Message body"
        And User "Valera" should receive the following "incoming" payload:
            | field                 | type    | required | format      |
            | client_msg_id         | string  | true     | uuid        |
            | suppress_notification | boolean | true     |             |
            | type                  | string  | true     | slackmtypes |
            | text                  | string  | true     |             |
            | user                  | string  | true     | slackuid    |
            | team                  | string  | true     | slacktid    |
            | user_team             | string  | true     | slacktid    |
            | source_team           | string  | true     | slacktid    |
            | channel               | string  | true     | slackchid   |
            | event_ts              | string  | true     | slackts     |
            | ts                    | string  | true     | slackts     |   

    Scenario: Check incoming message payload from "random" channel
        And I click on "channel item" with text "random"
        And I type "random text message"
        When I press the "Enter" keyboard button
        And User "Valera" should receive the following "incoming" payload:
            | field                 | type    | required | format      |
            | client_msg_id         | string  | true     | uuid        |
            | suppress_notification | boolean | true     |             |
            | type                  | string  | true     | slackmtypes |
            | text                  | string  | true     |             |
            | user                  | string  | true     | slackuid    |
            | team                  | string  | true     | slacktid    |
            | user_team             | string  | true     | slacktid    |
            | source_team           | string  | true     | slacktid    |
            | channel               | string  | true     | slackchid   |
            | event_ts              | string  | true     | slackts     |
            | ts                    | string  | true     | slackts     |