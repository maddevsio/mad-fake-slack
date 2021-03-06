Feature: Preformatted message formatting
    As a user, I want to send some words or all message as preformatted

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
    
    Scenario: Only one word as preformatted
        And I type "```preformatted```"
        When I press the "Enter" keyboard button
        Then I should see "preformatted" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                  |
            | <pre class="c-mrkdwn__pre">preformatted</pre> |

    Scenario: Two words as preformatted
        And I type "```one two```"
        When I press the "Enter" keyboard button
        Then I should see "one two" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                             |
            | <pre class="c-mrkdwn__pre">one two</pre> |

    Scenario: Two words on different lines
        And I type "```one "
        And I press the "Shift + Enter" keyboard button
        And I type "two```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one \ntwo |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                 |
            | <pre class="c-mrkdwn__pre">one <br>two</pre> |

    Scenario: Two words on different lines with breaklines in the middle
        And I type "```one "
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I type "two```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one \n\ntwo |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                         |
            | <pre class="c-mrkdwn__pre">one <br><br>two</pre> |

    Scenario: Two words on different lines as preformatted
        And I type "```one```"
        And I press the "Shift + Enter" keyboard button
        And I type "```two```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one\ntwo |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                             |
            | <pre class="c-mrkdwn__pre">one</pre><pre class="c-mrkdwn__pre">two</pre> |

    Scenario: No breaklines immediately after a preformatted start block
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "one```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                         |
            | <pre class="c-mrkdwn__pre">one</pre> |

    Scenario: No breaklines before a preformatted end block
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "one"
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                         |
            | <pre class="c-mrkdwn__pre">one</pre> |

    Scenario: Display two preformatted blocks separated by text
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "one"
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "some text"
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "two"
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one\nsome text\n\ntwo |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                          |
            | <pre class="c-mrkdwn__pre">one</pre>some text<br><pre class="c-mrkdwn__pre">two</pre> |

    Scenario: Display two preformatted blocks separated by breaklines
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "one"
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I type "two"
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one\ntwo |
        And Message has the following HTML content at "last" position in "Message body":
            """
<pre class="c-mrkdwn__pre">one</pre><span class="c-mrkdwn__br"></span><span class="c-mrkdwn__br"></span><pre class="c-mrkdwn__pre">two</pre>
            """
    
    Scenario: Preserve spaces at start and at the end of block and between words
        And I type "```    one two  three ```"
        When I press the "Enter" keyboard button
        Then I should see "last" multiline message with:
            | Message body | one two  three |
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                         |
            | <pre class="c-mrkdwn__pre">    one two  three </pre> |

    Scenario: Exclude preformatting with only begin block
        And I type "```one two"
        When I press the "Enter" keyboard button
        Then I should see "```one two" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ```one two   |

    Scenario: Exclude preformatting with only end block
        And I type "one two```"
        When I press the "Enter" keyboard button
        Then I should see "one two```" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | one two```   |

    Scenario: Exclude preformatting with no content
        And I type "``````"
        When I press the "Enter" keyboard button
        Then I should see "``````" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ``````       |

    Scenario: Exclude preformatting with spaces content
        And I type "```    ```"
        When I press the "Enter" keyboard button
        Then I should see "``` ```" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content |
            | ```    ```   |

    Scenario: Exclude preformatting with breaklines content
        And I type "```"
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I press the "Shift + Enter" keyboard button
        And I type "```"
        When I press the "Enter" keyboard button
        Then I should see "``````" in "Message body"
        And Message has the following HTML content at "last" position in "Message body":
            | html content                                                                                                                                   |
            | ```<span class="c-mrkdwn__br"></span><span class="c-mrkdwn__br"></span><span class="c-mrkdwn__br"></span><span class="c-mrkdwn__br"></span>``` |