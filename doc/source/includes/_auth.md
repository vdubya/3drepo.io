# Authentication

To authenicate
put 

`Authorization: Bearer <token>`

in your HTTP Header

## Login

> Example Request

```http
POST /login HTTP/1.1
```


```json
{
	"username": "repoman",
	"password": "1984fantasy"
}
```

> Example Responses


```http
HTTP/1.1 200 OK

```

```json
{
	"username": "repoman"
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZmVkIiwicm9sZXMiOlt7InJvbGUiOiJwcm9qMi5jb2xsYWJvcmF0b3IiLCJkYiI6ImZlZCJ9LHsicm9sZSI6InByb2oxLmNvbGxhYm9yYXRvciIsImRiIjoiZmVkIn0seyJyb2xlIjoiYWRtaW4iLCJkYiI6ImZlZCJ9XX0sImlhdCI6MTQ5Njg1MDMzMSwiZXhwIjoxNDk2ODU3NTMxfQ.Z9goqD9RWAO_jyUIOiLkBiVkHTbDMrVRKRfIDsoASkU"
}
```

### POST /login


To generate a json web token, you need to post user credential to this API

The payload of the json web token includes a field named `exp` which is a timestamp indicating when this token will expire.
### Request Attributes

Attribute | Required
--------- | ------- 
username | Yes
password | Yes 


## Get current username

> Example Request

```http
GET /login HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZmVkIiwicm9sZXMiOlt7InJvbGUiOiJwcm9qMi5jb2xsYWJvcmF0b3IiLCJkYiI6ImZlZCJ9LHsicm9sZSI6InByb2oxLmNvbGxhYm9yYXRvciIsImRiIjoiZmVkIn0seyJyb2xlIjoiYWRtaW4iLCJkYiI6ImZlZCJ9XX0sImlhdCI6MTQ5Njg1MDMzMSwiZXhwIjoxNDk2ODU3NTMxfQ.Z9goqD9RWAO_jyUIOiLkBiVkHTbDMrVRKRfIDsoASkU
```

> Example Responses

```json
{
	"username": "repoman"
}
```

### GET /login

Get the username of the logged in user.


## Logout

> Example Request

```http
POST /logout HTTP/1.1
```

```json
{}
```

> Example Responses

```json
{
	"username": "repoman"
}
```

### POST /logout

Invalidate the token.