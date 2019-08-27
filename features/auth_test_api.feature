Feature: Http API request/response
    As a user, I want to make requests and
    receive responses from the JSON API

    Background:
        Given My timezone is "Asia/Bishkek"
        And Restart the api server with the following envs:
            | PORT | 3000 |

    Scenario: Make auth.test POST request with token in body
        Then I send "GET" request to "http://localhost:3000/api/db/current/team?domain=localhost:3000" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
                    }
                },
                "response": {
                    "ok": true
                }
            }
            """
        When I send "POST" request to "http://localhost:3000/api/auth.test" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "token": "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
                    }
                },
                "response": {
                    "ok": true,
                    "url": "http://localhost:3000/",
                    "team": "BotFactory",
                    "user": "valera",
                    "team_id": "T12345678",
                    "user_id": "W12345679"
                }
            }
            """
        And Restart the api server with the following envs:
            | PORT | 9001 |

    Scenario: Make auth.test POST request with token in auth header
        Then I send "GET" request to "http://localhost:3000/api/db/current/team?domain=localhost:3000" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
                    }
                },
                "response": {
                    "ok": true
                }
            }
            """
        When I send "POST" request to "http://localhost:3000/api/auth.test" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
                    }
                },
                "response": {
                    "ok": true,
                    "url": "http://localhost:3000/",
                    "team": "BotFactory",
                    "user": "valera",
                    "team_id": "T12345678",
                    "user_id": "W12345679"
                }
            }
            """
        And Restart the api server with the following envs:
            | PORT | 9001 |

    Scenario: Make auth.test POST request without token
        When I send "POST" request to "http://localhost:3000/api/auth.test" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json"
                    }
                },
                "response": {
                    "ok": false,
                    "error": "invalid_auth"
                }
            }
            """
        And Restart the api server with the following envs:
            | PORT | 9001 |

    Scenario: Set URL_SCHEMA to "https" and make auth.test POST request
        And Restart the api server with the following envs:
            | URL_SCHEMA | https |
        When I send "GET" request to "http://localhost:3000/api/db/current/team?domain=localhost:3000" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
                    }
                },
                "response": {
                    "ok": true
                }
            }
            """
        Then I send "POST" request to "http://localhost:3000/api/auth.test" with conditions
            """
            {
                "request": {
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "token": "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
                    }
                },
                "response": {
                    "ok": true,
                    "url": "https://localhost:3000/",
                    "team": "BotFactory",
                    "user": "valera",
                    "team_id": "T12345678",
                    "user_id": "W12345679"
                }
            }
            """
        And Restart the api server with the following envs:
            | PORT       | 9001 |
            | URL_SCHEMA |      |