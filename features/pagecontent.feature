Feature: Content of fake slack main page
    As a user I want to see content on main page

    Background:
        Given My timezone is "Asia/Bishkek"
        And I am on "fake slack ui" page

    Scenario: Team name content
        Then I should see "BotFactory" in "Team name place"
    
    Scenario: Channels content
        Then I should see following channels:
            | channel name |
            | general      |
            | random       |

    Scenario: Direct channels content
        Then I should see following channels:
            | channel name  |
            | Valera Petrov |
            | Slackbot      |

    Scenario: App channels content
        Then I should see following channels:
            | channel name  |
            | Valera        |