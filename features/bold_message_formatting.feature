Feature: Bold message formatting
    As a user, I want to send some words or all message in bold

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
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

    Scenario: Formatting with more than one word
        And I type "*  bold line  with spaces   in    it*"
        When I press the "Enter" keyboard button
        Then I should see "bold line with spaces in it" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                                                                                                 |
            | <b>&nbsp;<wbr>&nbsp;<wbr>bold&nbsp;<wbr>line&nbsp;<wbr>&nbsp;<wbr>with&nbsp;<wbr>spaces&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>in&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>it</b> |

    Scenario: Bold formatting of two words on different lines
        And I type "*first*"
        When I press the "Shift + Enter" keyboard button
        And I type "*second*"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | first\nsecond |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                  |
            | <b>first</b><br><b>second</b> |

    Scenario: No bold formatting for word with space before ending star
        And I type "*       bold *"
        When I press the "Enter" keyboard button
        Then I should see "* bold *" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                   |
            | *&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>bold&nbsp;<wbr>* |

    Scenario: Only many stars
        And I type "****************"
        When I press the "Enter" keyboard button
        Then I should see "****************" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content     |
            | **************** |

    Scenario: Only stars separated with spaces
        And I type "** * * *  * *   * *     *"
        When I press the "Enter" keyboard button
        Then I should see "** * * * * * * * *" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                 |
            | ** * * *&nbsp;<wbr>&nbsp;<wbr>* *&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>* *&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>* |

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