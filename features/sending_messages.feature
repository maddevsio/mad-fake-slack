Feature: Sending messages
    As a user, I want to send messages to different channels

    Background:
        Given My timezone is "Asia/Bishkek"
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Sending simple text message to "general" channel
        And I type "my simple text message"
        When I press the "Enter" keyboard button
        Then I should see "my simple text message" in "Message body"
        And User "Valera" should receive message "my simple text message"