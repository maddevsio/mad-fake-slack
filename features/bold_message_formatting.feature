Feature: Bold message formatting
    As a user, I want to send some words or all message in bold

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |
    
    Scenario: Only one word in bold
        And I type "*bold*"
        When I press the "Enter" keyboard button
        Then I should see "bold" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | <b>bold</b>  |
    
    Scenario: Two words in bold sequentially
        And I type "*bold1* *bold2*"
        When I press the "Enter" keyboard button
        Then I should see "bold1 bold2" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content              |
            | <b>bold1</b> <b>bold2</b> |
    
    Scenario: Word surrounded with stars which between 2 stars
        And I type "* *bold* *"
        When I press the "Enter" keyboard button
        Then I should see "* bold *" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content     |
            | * <b>bold</b> *  |
    
    Scenario: Formatting with preserving spaces at the beginning
        And I type "*       bold*"
        When I press the "Enter" keyboard button
        Then I should see "bold" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                             |
            | <b>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>bold</b> |

    Scenario: No bold formatting for word with space before ending star
        And I type "*       bold *"
        When I press the "Enter" keyboard button
        Then I should see "* bold *" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                   |
            | *&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>bold&nbsp;<wbr>* |

    Scenario: Word with a star at the beginning without a closing star
        And I type "*bold"
        When I press the "Enter" keyboard button
        Then I should see "*bold" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | *bold        |

    Scenario: Only 2 stars
        And I type "**"
        When I press the "Enter" keyboard button
        Then I should see "**" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | **           |
    
    Scenario: Only 2 stars with any spaces between
        And I type "*     *"
        When I press the "Enter" keyboard button
        Then I should see "* *" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                              |
            | *&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>* |
    
    Scenario: Word with a double star at the beginning and at the end
        And I type "**bold**"
        When I press the "Enter" keyboard button
        Then I should see "**bold**" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | **bold**     |
    
    Scenario: Word with a double star at the end
        And I type "*bold**"
        When I press the "Enter" keyboard button
        Then I should see "*bold**" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | *bold**      |

    Scenario: With breakline separator
        And I type "*first line bold"
        When I press the "Shift + Enter" keyboard button
        And I type "second line bold*"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov                       |
            | Message body   | *first line bold\nsecond line bold* |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                          |
            | *first line bold<br>second line bold* |