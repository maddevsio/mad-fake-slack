Feature: Quote message formatting
    As a user, I want to send some words or all message in quote

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
    Scenario: Only one word in blockquote
        And I type ">quote"
        When I press the "Enter" keyboard button
        Then I should see "quote" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                           |
            | <blockquote class="c-mrkdwn__quote">quote</blockquote> |
    
    Scenario: More than one word in blockquote
        And I type ">quote with more than one word"
        When I press the "Enter" keyboard button
        Then I should see "quote with more than one word" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                   |
            | <blockquote class="c-mrkdwn__quote">quote with more than one word</blockquote> |

    Scenario: Multiline blockquote formatting without breaklines
        And I type ">quote line 1"
        And I press the "Shift + Enter" keyboard button
        And I type ">quote line 2"
        And I press the "Shift + Enter" keyboard button
        And I type ">quote line 3"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | quote line 1\nquote line 2\nquote line 3 |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                  |
            | <blockquote class="c-mrkdwn__quote">quote line 1<br>quote line 2<br>quote line 3</blockquote> |

    Scenario: Multiline blockquote formatting with breaklines
        And I type ">quote line 1"
        And I press the "Shift + Enter" keyboard button
        And I type ">"
        And I press the "Shift + Enter" keyboard button
        And I type ">"
        And I press the "Shift + Enter" keyboard button
        And I type ">"
        And I press the "Shift + Enter" keyboard button
        And I type ">quote line 2"
        And I press the "Shift + Enter" keyboard button
        And I type ">quote line 3"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | quote line 1\n\n\n\nquote line 2\nquote line 3 |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                              |
            | <blockquote class="c-mrkdwn__quote">quote line 1<br><br><br><br>quote line 2<br>quote line 3</blockquote> |
    
    Scenario: Two blockquote lines separated with text
        And I type ">quote line 1"
        And I press the "Shift + Enter" keyboard button
        And I type "some text"
        And I press the "Shift + Enter" keyboard button
        And I type ">quote line 2"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | quote line 1\n\nsome text\n\nquote line 2 |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                                                                |
            | <blockquote class="c-mrkdwn__quote">quote line 1<br></blockquote>some text<br><blockquote class="c-mrkdwn__quote">quote line 2</blockquote> |

    Scenario: Do not render next lines as blockquote if starts with spaces
        And I type ">quote line 1"
        And I press the "Shift + Enter" keyboard button
        And I type " >not blockquote 1"
        And I press the "Shift + Enter" keyboard button
        And I type "  >not blockquote 2"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | quote line 1\n\n>not blockquote 1\n  >not blockquote 2 |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                                                         |
            | <blockquote class="c-mrkdwn__quote">quote line 1<br></blockquote> &gt;not blockquote 1<br>&nbsp;<wbr>&nbsp;<wbr>&gt;not blockquote 2 |

    Scenario: Preserve spaces inside quote
        And I type ">  quote line 1"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | quote line 1 |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                      |
            | <blockquote class="c-mrkdwn__quote">&nbsp;<wbr>&nbsp;<wbr>quote&nbsp;<wbr>line&nbsp;<wbr>1</blockquote> |