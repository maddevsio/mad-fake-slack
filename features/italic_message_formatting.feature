Feature: Italic message formatting
    As a user, I want to send some words or all message in italic format

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page

    Scenario: Only one word in italic
        And I type "_italic_"
        When I press the "Enter" keyboard button
        Then I should see "italic" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content  |
            | <i>italic</i> |

    Scenario: Only one word with any spaces in italic
        And I type "_   italic  _"
        When I press the "Enter" keyboard button
        Then I should see "italic" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                         |
            | <i>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>italic&nbsp;<wbr>&nbsp;<wbr></i> |

    Scenario: Word surrounded with spaces and underscores
        And I type "_ _   italic  _ _"
        When I press the "Enter" keyboard button
        Then I should see "_ italic _" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                       |
            | <i>&nbsp;<wbr>_&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>italic&nbsp;<wbr>&nbsp;<wbr></i> _ |

    Scenario: Skip italic block with breakline inside
        And I type "_italic"
        And I press the "Shift + Enter" keyboard button
        And I type "_"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body   | _italic\n_ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | _italic<br>_ |

    Scenario: Skip italic block surrounded by double underscores
        And I type "__italic__"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | __italic__ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | __italic__   |

    Scenario: Skip italic block with empty content
        And I type "__"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | __ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | __           |

    Scenario: Skip italic block with spaced content
        And I type "_     _"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | _     _ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | _&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>&nbsp;<wbr>_ |

    Scenario: Skip italic block with underscore content
        And I type "___"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | ___ |
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ___          |