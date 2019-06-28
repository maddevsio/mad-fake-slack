Feature: Content of fake slack main page
    As a user I want to see content on main page

    Background:
        Given My timezone is "Asia/Bishkek"
        And I am on "fake slack ui" page

    Scenario: Team name content
        Then I should see "BotFactory" in "Team name"

    Scenario: Team user name content
        Then I should see "Valera Petrov" in "Team user name"

    Scenario: Client header channel name content
        Then I should see "#general" in "Channel title"

    Scenario: Client header favorite button
        Then I should see icon "Favorite" in "Channel header information"

    Scenario: Client header members button
        Then I should see icon "Users" in "Channel header information"
        And I should see "2" in "Channel members count"

    Scenario: Empty message container for "general" channel
        Then I should see "0" messages
    
    Scenario: Client header topic
        Then I should see "Talk about anything!" in "Channel header topic"

    Scenario: Client header controls
        Then I should see the following controls in "Channel header buttons":
            | control name           |
            | Recent mentions button |
            | Stars toggle button    |
            | Flex toggle button     |

    Scenario: Input message controls
        Then I should see the following controls in "Input message container":
            | control name           |
            | Input message          |
            | File upload button     |
            | Emoji button           |
            | User mentions button   |

    Scenario: Notification controls
        Then I should see the following controls in "Notification bar container":
            | control name               |
            | Left notification section  |
            | Right notification section |

    Scenario: Right notification section
        Then I should see "*bold* _italics_ ~strike~ `code` ```preformatted``` >quote" in "Right notification section"

    Scenario: Channels content
        Then I should see following channels between "Channels" and "Add a channel":
            | channel name |
            | general      |
            | random       |

    Scenario: Direct channels content
        Then I should see following channels between "Direct Messages" and "Invite people":
            | channel name  |
            | Valera Petrov |
            | Slackbot      |

    Scenario: App channels content
        Then I should see following channels between "Apps" and "":
            | channel name  |
            | Valera        |

    Scenario: Default selected channel
        Then I should see "general" as selected channel