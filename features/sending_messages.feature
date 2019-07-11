Feature: Sending messages
    As a user, I want to send messages to different channels

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Sending simple text message to "general" channel
        And I type "my simple text message"
        When I press the "Enter" keyboard button
        Then I should see "my simple text message" in "Message body"
        And User "Valera" should receive messages:
            | message                        | channel |
            | my simple text message         | general |

    Scenario: Sending simple text message to "random" channel
        And I click on "channel item" with text "random"
        And I type "text message to random channel"
        When I press the "Enter" keyboard button
        Then I should see "text message to random channel" in "Message body" on the "last" position
        And User "Valera" should receive messages:
            | message                        | channel |
            | text message to random channel | random  |