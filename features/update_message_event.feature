Feature: Like a bot, I want to receive an event
         about updating the contents of the message in the channel

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Checking a format of "message_changed" subtype message
        And I send "first message" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        And I press the "ArrowUp" keyboard button
        And I type " edited"
        And I press the "Enter" keyboard button
        And I'm waiting for "Inline Message Editor" to be hidden
        When I should see "first message edited" in "Message body"
        Then User "Valera" should receive "incoming" payload with "message" type:
            | field            | type                       | required | format         |
            | type             | string                     | true     | slackmtypes    |
            | subtype          | string                     | true     | slackmsubtypes |
            | hidden           | boolean                    | true     |                |
            | message          | /ChatUpdateMessage         | true     |                |
            | channel          | string                     | true     | slackchid      |
            | previous_message | /ChatUpdatePreviousMessage | true     |                |
            | event_ts         | string                     | true     | slackts        |
            | ts               | string                     | true     | slackts        |
