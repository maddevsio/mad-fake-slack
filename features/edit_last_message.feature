Feature: 
    As a user, I want to edit my last message

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Edit last sent message
        And I type "first message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When I press the "ArrowUp" keyboard button
        And I type " edited"
        And I click on "button" with text "⏎ Save Changes" without navigation
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov        |
            | Message body   | first message edited |

    Scenario: Edit my message, which is displayed before the bot message
        And I type "very first message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov      |
            | Message body   | very first message |
        And User "Valera" send message:
            | type    | message     |
            | text    | from Valera |
            | channel | general     |
        When I press the "ArrowUp" keyboard button
        And I type " edited"
        And I click on "button" with text "⏎ Save Changes" without navigation
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "first" multiline "Message item" with:
            | Message sender | Valera Petrov             |
            | Message body   | very first message edited |

    Scenario: Edit my last message in sequence between bot and me
        And I send "first message" to chat
        And User "Valera" send message:
            | type    | message     |
            | text    | from Valera |
            | channel | general     |
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera      |
            | Message body   | from Valera |
        And I send "second message" to chat
        When I press the "ArrowUp" keyboard button
        And I type " edited"
        And I click on "button" with text "⏎ Save Changes" without navigation
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov         |
            | Message body   | second message edited |
    
    Scenario: Cancel editing my message
        And I send "first message" to chat
        And I press the "ArrowUp" keyboard button
        And I type " edited"
        When I click on "button" with text "Cancel" without navigation
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |

    Scenario: Cancel editing my message by pressing Escape button
        And I send "first message" to chat
        And I press the "ArrowUp" keyboard button
        And I type " edited"
        When I press the "Escape" keyboard button
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |

    Scenario: Changes in the message are persistent
        And I send "first message" to chat
        And I press the "ArrowUp" keyboard button
        And I type " edited"
        And I click on "button" with text "⏎ Save Changes" without navigation
        And I'm waiting for "Inline Message Editor" to be hidden
        When I reload the page
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov        |
            | Message body   | first message edited |

    Scenario: Don't show editor for last message when message textbox is not empty
        And I send "first message" to chat
        And I type multiline message:
        """
        new first line
        and then second line
        and third line
        """
        When I press the "ArrowUp" keyboard button
        Then I should not see "Inline Message Editor"