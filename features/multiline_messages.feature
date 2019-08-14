Feature: Multiline messages
    As a user, I want to send messages 
    with my own linebreaks
    between sentences or parts of a message.

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
    Scenario: Add linebreaks using `Ctrl + Enter`
        And I type "first line 1"
        And I press the "Control + Enter" keyboard button
        And I type "second line 1"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov               |
            | Message body   | first line 1\nsecond line 1 |
    
    Scenario: Removes linebreaks (`Ctrl + Enter`) at the begining of message
        And I press the "Control + Enter" keyboard button
        And I press the "Control + Enter" keyboard button
        And I press the "Control + Enter" keyboard button
        And I type "second line 1"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov |
            | Message body   | second line 1 |
    
    Scenario: Removes linebreaks (`Ctrl + Enter`) at the end of message
        And I type "first line 1"
        And I press the "Control + Enter" keyboard button
        And I press the "Control + Enter" keyboard button
        And I press the "Control + Enter" keyboard button
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov |
            | Message body   | first line 1  |

    Scenario: Add linebreaks using `Shift + Enter`
        And I type "first line 2"
        And I press the "Shift + Enter" keyboard button
        And I type "second line 2"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov               |
            | Message body   | first line 2\nsecond line 2 |
    
    Scenario: Removes linebreaks (`Shift + Enter`) at the begin of message
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I type "second line 2"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov |
            | Message body   | second line 2 |

    Scenario: Removes linebreaks (`Shift + Enter`) at the end of message
        And I type "first line 2"
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov |
            | Message body   | first line 2  |

    Scenario: Paste multiline text from clipboard to messagebox
        And I copied the following text to the clipboard:
            | text                     | 
            | first\nsecond\nthird     |
        And I memorize the "clientHeight" of "Input message"
        When I press the "Control + KeyV" keyboard button
        And The "clientHeight" with type "Number" of the "Input message" must "toBeGreaterThan" last
    
    Scenario: The maximum height growth for the contents of a multi-line message
        And I memorize the "clientHeight" of "Input message"
        And I type "line 1"
        And I press the "Control + Enter" keyboard button
        And The "clientHeight" with type "Number" of the "Input message" must "toBeGreaterThan" last
        And I type "line 2"
        And I press the "Control + Enter" keyboard button
        And I type "line 3"
        And I press the "Control + Enter" keyboard button
        And I type "line 4"
        And I press the "Control + Enter" keyboard button
        And I type "line 5"
        And I press the "Control + Enter" keyboard button
        And I memorize the "clientHeight" of "Input message"
        And I type "line 6"
        And I press the "Control + Enter" keyboard button
        And The "clientHeight" with type "Number" of the "Input message" must "toBeGreaterThan" last
        And I type "line 7"
        When I memorize the "clientHeight" of "Input message"
        And I press the "Control + Enter" keyboard button
        And I type "line 8"
        And I press the "Control + Enter" keyboard button
        And I type "line 9"
        Then The "clientHeight" with type "Number" of the "Input message" must "toEqual" last