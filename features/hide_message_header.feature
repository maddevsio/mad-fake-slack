Feature: Hide header for sequence of messages from one user
    As a user, I don't want to see header for each one by one messages from me

    Background:
        Given My timezone is "Asia/Bishkek"
        And Fake slack db is empty
        And I am on "fake slack ui" page
        And User "Valera" connected to fake slack using parameters:
            | token | xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT |
            | url   | http://localhost:9001/api/       |

    Scenario: Display header for first message from sequence
        And I type "first message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When I type "second message"
        And I press the "Enter" keyboard button
        Then I should see "last" multiline "Message item" with:
            | Message sender | <not exists>   |
            | Message body   | second message |

    Scenario: Display header for message sequence between bot and client one by one
        And I type "first message"
        And I press the "Enter" keyboard button
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When User "Valera" send message:
            | type    | message           |
            | text    | first bot message |
            | channel | general           |
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera            |
            | App badge      | APP               |
            | Message body   | first bot message |

    Scenario: Display only header only for first message in sequence between bot and client
        And I send "first message" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        And I send "second message" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | <not exists>   |
            | Message body   | second message |
        And User "Valera" send message:
            | type    | message           |
            | text    | first bot message |
            | channel | general           |
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera            |
            | App badge      | APP               |
            | Message body   | first bot message |
        When User "Valera" send message:
            | type    | message            |
            | text    | second bot message |
            | channel | general            |
        Then I should see "last" multiline "Message item" with:
            | Message sender | <not exists>       |
            | App badge      | <not exists>       |
            | Message body   | second bot message |

    Scenario: Show message header if time interval passed
        And Now is the date and time "2019-09-04T06:50:53.953Z"
        And I send "first message" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        When Now "6" minutes passed
        And I send "second message" to chat
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov  |
            | Message body   | second message |

    Scenario: Show message header for message which break the sequence
        And Now is the date and time "2019-09-04T06:50:53.953Z"
        And I send "first message" to chat
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov |
            | Message body   | first message |
        And Now "3" minutes passed
        And User "Valera" send message:
            | type    | message           |
            | text    | first bot message |
            | channel | general           |
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera            |
            | Message body   | first bot message |
        When Now "4" minutes passed
        And I send "second message" to chat
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera Petrov  |
            | Message body   | second message |
    
    Scenario: Hide message header after first bot message in sequence
        And Now is the date and time "2019-09-04T06:50:53.953Z"
        And User "Valera" send message:
            | type    | message           |
            | text    | first bot message |
            | channel | general           |
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera            |
            | Message body   | first bot message |
        And Now "1" minutes passed
        When User "Valera" send message:
            | type    | message            |
            | text    | second bot message |
            | channel | general            |
        Then I should see "last" multiline "Message item" with:
            | Message sender | <not exists>       |
            | Message body   | second bot message |

    Scenario: Show message header after time interval passed for next bot message
        And Now is the date and time "2019-09-04T06:50:53.953Z" for "Valera" user
        And User "Valera" send message:
            | type    | message           |
            | text    | first bot message |
            | channel | general           |
        And I should see "last" multiline "Message item" with:
            | Message sender | Valera            |
            | Message body   | first bot message |
        And Now "6" minutes passed for "Valera" user
        When User "Valera" send message:
            | type    | message            |
            | text    | second bot message |
            | channel | general            |
        Then I should see "last" multiline "Message item" with:
            | Message sender | Valera             |
            | Message body   | second bot message |