Feature: Incoming user typing message payload
    As a user, I want to broadcast event 
    about my activity in the text box 
    every 5 seconds

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Send "user_typing" event to "general" channel
        And I type "general text message"
        Then User "Valera" should receive "incoming" payload with "user_typing" type:
            | field    | type   | required | format      |
            | type     | string | true     | slackmtypes |
            | user     | string | true     | slackuid    |
            | channel  | string | true     | slackchid   |

    Scenario: Send "user_typing" event to "random" channel
        And I click on "channel item" with text "random"
        And I type "random text message"
        And User "Valera" should receive "incoming" payload with "user_typing" type:
            | field   | type   | required | format      |
            | type    | string | true     | slackmtypes |
            | user    | string | true     | slackuid    |
            | channel | string | true     | slackchid   |