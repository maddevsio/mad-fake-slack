Feature: Breaks in the middle of message
    As a user, I want to be able to insert breaks in my typed message

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page

    Scenario: Insert break in the middle of typed message
        And I type "first line second line"
        And I press the "ArrowLeft" keyboard button "12" times
        And I press the "Shift + Enter" keyboard button
        And I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | first line\nsecond line |
        And Message has the following HTML content at "last" position in "Message body":
            | html content               |
            | first line<br> second line |

    Scenario: Insert a break at the closest starting position of the typed message
        And I type "first line second line"
        And I set cursor to the "1" position of the text
        And I press the "Shift + Enter" keyboard button
        And I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | f\nirst line second line |
        And Message has the following HTML content at "last" position in "Message body":
            | html content               |
            | f<br>irst line second line |

    Scenario: Insert a break at the closest ending position of the typed message
        And I type "first line second line"
        And I set cursor to the "21" position of the text
        And I press the "Shift + Enter" keyboard button
        And I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | first line second lin\ne |
        And Message has the following HTML content at "last" position in "Message body":
            | html content               |
            | first line second lin<br>e |