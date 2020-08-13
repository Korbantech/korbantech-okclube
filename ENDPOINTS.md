# End Point Nd App Server

## Attention!
---
All request response has header
`Content-Type`: `application/json`;

All request has accept
`application/json` or `application/x-www-form-urlencoded`

### Polls `/polls`
---
  - POST
    #### body: [Poll Body](#poll-create)
    #### reponse: [Poll](#poll)
  - GET
    #### params: [Polls params](#poll-list-params)
    #### response:
      - without user param: __Array<[Poll](#poll)>__
      - with user param: __Array<[Poll with response](#poll-with-user-response)>__

### Polls `/polls/:id`
---
  - POST
    #### body: [Poll Response](#poll-response-body)
    #### response: status 200
  - GET
    #### response: [Poll Response](#poll-response-response)
  - PUT
    #### body: [Poll Body](#poll-create)
    #### response: [Poll](#poll)
  - PATCH
    #### body: [Poll Partial](#poll-partial)
    #### response: [Poll](#poll)
  - DELETE
    #### response: status 200

### Polls `/polls/:id/comments`
---
  - GET
    #### params: [Poll Comments Params](#poll-comments-params)
    #### response: [Poll Comment](#poll-comment)
  - POST
    #### body: [Poll Comment Body](#poll-comment-body)
    #### response: status 2000
    
## Data
---
  - ### <a name="poll-comment-byd"></a>Poll Comment Body:
    |field|required|type|
    |-|-|-|
    |user|yes|bigint|
    |poll|yes|string|
    |comment|yes|string|
  - ### <a name="poll-comment"></a>Poll Comment:
    |field|type|description|
    |-|-|-|
    |poll|bigint|poll id|
    |name|string|user name|
    |comment|string|user comment|
    |user|bigint|user id|
    |created_at|timestamp|date of create|
    |updated_at|timestamp|date of last update|
    |deleted_at|timestamp\|null|date of delete|
  - ### <a name="poll-comments-params"></a>Poll Comments Params:
    #### extends [Polls Params](#poll-list-params)

  - ### <a name="poll-response-response"></a>Poll Response:
    | field  |      type      |
    |--------|----------------|
    |   key  |enum "yes", "no"|
    |   qty  |      int       |
  - ### <a name="poll-response-body"></a>Poll Response Body:
    | field  |required|      type      | description |
    |--------|--------|----------------|-------------|
    |  user  |  yes   |      int       |   user id   |
    |response|  yes   |enum "yes", "no"|user response|

  - ### <a name="poll-list-params"></a>Polls Params:
    | field  |required|  type   | description |
    |--------|--------|---------|-------------|
    |  limit |   no   |   int   |limit results|
    |  page  |   no   |   int   |config page of results|
    |  user  |   no   |  bigint |user for additional field in response|
    |  order |   no   | enum "id", "text", "program", "created_at", "deleted_at", "updated_at" |config field to order|
    |excluded|   no   | enum boolean, "only" | config if allow excluded polls or result only excludeds
    ---
  - ### <a name="poll-partial"></a>Poll Partial:
    | field |required|  type  | description |
    |-------|--------|--------|-------------|
    |  text |   no   | string |text for poll|
    |program|   no   |  int   |  program id |
    ---
  - ### <a name="poll-create"></a>Poll Create:
    | field |required|  type  | description |
    |-------|--------|--------|-------------|
    |  text |  yes   | string |text for poll|
    |program|  yes   |  int   |  program id |
    ---
  - ### <a name="poll"></a>Poll
    |  field   |  type   |
    |----------|---------|
    |   text   | string  |
    | program  |   int   |
    |created_at|timestamp|
    |updated_at|timestamp|
    |deleted_at|   null  |
    ---
  - ### <a name="poll-with-user-response"></a>Poll with user response
    |  field   |        type          |
    |----------|----------------------|
    |   text   |       string         |
    | program  |         int          |
    |created_at|      timestamp       |
    |updated_at|      timestamp       |
    |deleted_at|   timestamp\|null    |
    | response |enum "yes", "no", null|
