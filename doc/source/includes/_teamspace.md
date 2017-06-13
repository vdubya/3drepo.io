# Teamspace

## Sign up
> Example Request

```http
POST /teamspaces HTTP/1.1
```


```json
{
	"name": "repoman",
	"email": "repo-man@3drepo.org",
	"password": "1984fantasy",
	"firstName": "Otto",
	"lastName": "Maddox",
	"company": "Universal Pictures",
	"countryCode": "US",
	"jobTitle": "Punk Rocker",
	"phoneNo": "12345678",
	"captcha": "1234567890qwertyuiop"


}
```
> Example Responses

```json
{
	"teamspace": "repoman"
}
```


### POST /teamspaces

Sign up a new account.


### Request body

Attribute | Required | Format
--------- | ------- | -------
name | Yes | only alphabets and numbers and starts with an alphabet, less than 20 characters
password | Yes | 
email | Yes | valid email address
firstName | No
lastName | No
company | No
jobTitle | No
countryCode | No | ISO 3166-1 alpha-2
captcha | *Yes | Google reCAPTCHA response token

\* Depends on server config file

## Verify

> Example Request

```http
POST /teamspaces/repoman/verify HTTP/1.1
```
```json
{ "token": "1234567890" }
```


> Example Response

```json
{ "teamspace": "repoman" }
```

### POST /teamspaces/{teamspace}/verify

Verify an account after signing up


Attribute | Required 
--------- | ------- 
token | Yes 


## List info

> Example Request

```http
GET /teamspaces/repoman.json HTTP/1.1
```

> Example Response

```json
{
	"teamspaces": [
		{
			"teamspace": "repoman",
			"models": [
				{
					"permissions": [
						"change_model_settings",
						"upload_files",
						"create_issue",
						"comment_issue",
						"view_issue",
						"view_model",
						"download_model",
						"edit_federation",
						"delete_federation",
						"delete_model",
						"manage_model_permission"
					],
					"model": "00000000-0000-0000-0000-000000000000",
					"name": "ufo",
					"status": "ok",
					"timestamp": "2016-07-26T15:52:11.000Z"
				}
			],
			"fedModels": [],
			"isAdmin": true,
			"permissions": [
				"teamspace_admin"
			],
			"quota": {
				"spaceLimit": 10485760,
				"collaboratorLimit": 5,
				"spaceUsed": 12478764
			},
			"projects": []
		},
		{
			"teamspace": "breakingbad",
			"models": [
				{
					"permissions": [
						"view_issue",
						"view_model",
						"upload_files",
						"create_issue"
					],
					"model": "00000000-0000-0000-0000-000000000001"
					"name": "homelab",
					"status": "ok",
					"timestamp": null
				}
			],
			"fedModels": [
				{
					"federate": true,
					"permissions": [
						"change_model_settings",
						"upload_files",
						"create_issue",
						"comment_issue",
						"view_issue",
						"view_model",
						"download_model",
						"edit_federation",
						"delete_federation",
						"delete_model",
						"manage_model_permission"
					],
					"model": "00000000-0000-0000-0000-000000000003",
					"name": "fed1",
					"status": "ok",
					"timestamp": "2017-05-11T12:49:59.000Z",
					"subModels": [
						{
							"database": "breakingbad",
							"model": "00000000-0000-0000-0000-000000000001",
							"name": "homelab"
						},
						{
							"database": "breakingbad",
							"model": "00000000-0000-0000-0000-000000000002",
							"name": "laundrylab"
						}
					]
				}
			],
			"projects": [
				{
					"_id": "58f78c8ededbb13a982114ee",
					"name": "folder1",
					"permission": [],
					"models": [
						{
							"permissions": [
								"view_issue",
								"view_model",
								"upload_files",
								"create_issue"
							],
							"model": "00000000-0000-0000-0000-000000000004"
							"name": "laundrylab",
							"status": "ok",
							"timestamp": null
						}
					]
				}
			]
		}
	],
	"email": "test3drepo@mailinator.com",
	"billingInfo": {
		"countryCode": "US",
		"postalCode": "0",
		"line2": "123",
		"city": "123",
		"line1": "123",
		"vat": "000",
		"company": "Universal Pictures",
		"lastName": "Maddox",
		"firstName": "Otto",
		"_id": "59145aedf4f613668fba0f98"
	},
	"hasAvatar": true,
	"jobs": [
		{
			"_id": "Director"
		},
		{
			"_id": "Actor"
		},
		{
			"_id": "Producer"
		}
	]
}
```

### GET /teamspaces/{teamspace}.json

Return teamspace information and list of projects and models grouped by teamspace this user have access to.

### Return body

Attribute |  Format | Description
--------- | ------- | ---------------
teamspaces | | list of teamspace object
email | | 
billingInfo ||
hasAvatar | boolean | whether the teamspace has an avatar
jobs | | list of [job objects](#job-object)

### Teamspace object

Attribute |  Format | Description
--------- | ------- | ---------------
teamspace   | | teamspace name
models  | | list of [model objects](#model-object), listed here if they do not belongs to any project
fedModels | | list of federated [model objects](#model-object), listed here if they do not belongs to any project
projects | | list of [projects (folders) objects](#project-object-in-teamspace-info)
isAdmin `deprecated` | | is user an teamspace admin of this teamspace
permissions | list of [teamspace level permission](#teamspace-level)  | list of permissions user has in this teamspace
firstName ||
lastName ||
quota | [quota object](#quota-object) | 

### Quota object

Attribute           |  Description                  | Format
------------------- | ----------------------------- | ---------------
spaceLimit          | teamspace space limit           | integer, size in byte
collaboratorLimit   | teamspace collaborator limit    | integer, size in byte
spaceUsed           | teamspace space limit           | integer, size in byte

### Project Object (in teamspace info)
Attribute           |  Description                  
------------------- | ----------------------------- 
_id |
name | project name 
permissions | list of [project level permissions](#project-level)
models | list of [model objects](#model-object) belong to this project

### Model Object
Attribute           |  Description                                  | Format
------------------- | ----------------------------------------------|----------------------
model             |  model id                                       | UUID
name                | model name                                    |
status              |  upload status                                | ok, processing, failed
timestamp           |  date last changed                            | ISO 8601
permissions         |  lise of [model level permissions](#model-level)      |
federate            |  is the model a federated model               | always true, attribute absent for non-federated project
subModels         |  list of sub models if it is a federated model

## Get avatar

> Example Request

```http
GET /repoman/avatar HTTP/1.1
```

> Example Responses

```plaintext
<binary image>
```

### GET /teamspaces/{teamspace}/avatar

Return avatar if user has one.


## Upload avatar

> Example Request

```http
POST /teamspaces/repoman/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf

------WebKitFormBoundaryN8dwXAkcO1frCHLf
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<binary content>
------WebKitFormBoundaryN8dwXAkcO1frCHLf--

```

> Example Responses

```json
{
	"status":"success"
}
```

### POST /teamspaces/{teamspace}/avatar

Upload an image. Only multipart form data content type will be accepted.

Request body

Attribute           |  Description                                  
------------------- | ----------------------------------------------
file             |  The image to be uploaded                          


## Update teamspace info

> Example request

```http
PUT /teamspaces/repoman HTTP/1.1
```
```json
{
	"firstName": "Heisenberg"
	"lastName": "White"
	"email": "heisenberg@3drepo.org"
}
```

> Example Response

```json
{
	"teamspace":"repoman"
}
```

### PUT /teamspace/{teamspace}

Update teamspace information.

### Request body

Attribute | Required | Format
--------- | ------- | -------
email | No | valid email address
firstName | No
lastName | No


## Reset password

> Example request

```http
PUT /teamspaces/repoman HTTP/1.1
```
```json
{
	"oldPassword": "1984fantasy",
	"newPassword": "ElPaso"
}
```



> Example Response

```json
{
	"teamspace":"repoman"
}
```

### PUT /teamspaces/{teamspace}

Reset password. New password must be different.

### Request body

Attribute | Required 
--------- | ------- 
oldPassword | Yes 
newPassword | Yes 



### PUT /teamspaces/{teamspace}/password

Reset password by token.

Attribute | Required 
--------- | ------- 
token | Yes 
newPassword | Yes 


## Forgot password

> Example Request

```http
POST /teamspaces/repoman/forgot-password HTTP/1.1
```
```json
	{ "email": "repoman@3drepo.org"}
```

> Example response

```json
{}
```

### POST /teamspaces/{teamspace}/forgot-password

### Request body

Send a reset password link to user's email.

Attribute | Required 
--------- | ------- 
email | Yes 



