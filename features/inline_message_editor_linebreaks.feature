Feature: Breaks in the middle of inline edited message
    As a user, I want to be able to insert breaks for inline message editing

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page

    Scenario: Finish editing the last sent message by pressing Enter
        And I send "first message" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When I press the "ArrowUp" keyboard button
        And I type " edited"
        And I press the "Enter" keyboard button
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov        |
            | Message body   | first message edited |

    Scenario: Edit inline message with additional line
        And I send "first line" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first line    |
        When I press the "ArrowUp" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I type "second line"
        And I press the "Enter" keyboard button
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov           | 
            | Message body   | first line\nsecond line |

    Scenario: Add new line using Ctrl+Enter
        And I send "first line" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first line    |
        When I press the "ArrowUp" keyboard button
        And I press the "Control + Enter" keyboard button
        And I type "second line"
        And I press the "Enter" keyboard button
        And I'm waiting for "Inline Message Editor" to be hidden
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov           |
            | Message body   | first line\nsecond line |
   
    Scenario: Insert break in the middle of typed message
        And I send "first line second line" to chat
        When I press the "ArrowUp" keyboard button
        And I press the "ArrowLeft" keyboard button "12" times
        And I press the "Shift + Enter" keyboard button
        And I press the "Enter" keyboard button
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov           |
            | Message body   | first line\nsecond line |
        And Message has the following HTML content at "last" position in "Message body":
            | html content              |
            | first line<br>second line |

    Scenario: Re-editing message with new line should not break previous breaklines
        And I type "first line"
        And I press the "Shift + Enter" keyboard button
        And I type "second line"
        And I press the "Enter" keyboard button
        When I press the "ArrowUp" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I type "new line"
        And I press the "Enter" keyboard button
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov                     |
            | Message body   | first line\nsecond line\nnew line |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                          |
            | first line<br>second line<br>new line |
