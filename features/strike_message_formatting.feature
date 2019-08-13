Feature: Strike message formatting
    As a user, I want to send some words or all message in strikethrough style

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
    Scenario: Only one word in strike
        And I type "~strike~"
        When I press the "Enter" keyboard button
        Then I should see "strike" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | <s>strike</s> |
    
    Scenario: Two words in strike sequentially
        And I type "~strike1~ ~strike2~"
        When I press the "Enter" keyboard button
        Then I should see "strike1 strike2" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                  |
            | <s>strike1</s> <s>strike2</s> |

    Scenario: Word surrounded with tildes which between 2 tildes
        And I type "~ ~strike~ ~"
        When I press the "Enter" keyboard button
        Then I should see "~ strike ~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content      |
            | ~ <s>strike</s> ~ |
    
    Scenario: Formatting with preserving spaces at the beginning
        And I type "~       strike~"
        When I press the "Enter" keyboard button
        Then I should see "strike" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                               |
            | <s>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>strike</s> |
    
    Scenario: Formatting with more than one word
        And I type "~  strike line  with spaces   in    it~"
        When I press the "Enter" keyboard button
        Then I should see "strike line with spaces in it" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                                                                                                   |
            | <s>&nbsp;<wbr>&nbsp;<wbr>strike&nbsp;<wbr>line&nbsp;<wbr>&nbsp;<wbr>with&nbsp;<wbr>spaces&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>in&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>it</s> |

    Scenario: No strike formatting for word with space before ending tilda
        And I type "~       strike ~"
        When I press the "Enter" keyboard button
        Then I should see "~ strike ~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                     |
            | ~&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>strike&nbsp;<wbr>~ |

    Scenario: Strike formatting of two words on different lines
        And I type "~first~"
        When I press the "Shift + Enter" keyboard button
        And I type "~second~"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body   | first\nsecond |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                  |
            | <s>first</s><br><s>second</s> |

    Scenario: Skip strike formatting if starts from double tilde
        And I type "~~first~"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | ~~first~ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ~~first~     |

    Scenario: Skip strike formatting if starts from double tilde and spaces
        And I type "~~   first~"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | ~~   first~ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                              |
            | ~~&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>first~ |

    Scenario: Only many tildes
        And I type "~~~~~~~~~~~~~~~~"
        When I press the "Enter" keyboard button
        Then I should see "~~~~~~~~~~~~~~~~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content     |
            | ~~~~~~~~~~~~~~~~ |
    
    Scenario: Only tildes separated with spaces
        And I type "~~ ~ ~ ~  ~ ~   ~ ~     ~"
        When I press the "Enter" keyboard button
        Then I should see "~~ ~ ~ ~ ~ ~ ~ ~ ~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                 |
            | ~~ ~ ~ ~&nbsp;<wbr>&nbsp;<wbr>~ ~&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>~ ~&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>~ |
    
    Scenario: Word with a tilda at the beginning without a closing tilda
        And I type "~strike"
        When I press the "Enter" keyboard button
        Then I should see "~strike" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ~strike      |

    Scenario: Only 2 tildes
        And I type "~~"
        When I press the "Enter" keyboard button
        Then I should see "~~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ~~           |
    
    Scenario: Only 2 tildes with any spaces between
        And I type "~     ~"
        When I press the "Enter" keyboard button
        Then I should see "~ ~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                              |
            | ~&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>~ |
    
    Scenario: Word with a double tildes at the beginning and at the end
        And I type "~~strike~~"
        When I press the "Enter" keyboard button
        Then I should see "~~strike~~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ~~strike~~   |
    
    Scenario: Word with a double tildes at the end
        And I type "~strike~~"
        When I press the "Enter" keyboard button
        Then I should see "~strike~~" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ~strike~~ |
    
    Scenario: With breakline separator
        And I type "~first line strike"
        When I press the "Shift + Enter" keyboard button
        And I type "second line strike~"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message sender | Valera Petrov                           |
            | Message body   | ~first line strike\nsecond line strike~ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                              |
            | ~first line strike<br>second line strike~ |