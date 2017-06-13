# Teamspace permission

## Teamspace permission object
Attribute          | Description
------------------ | ------- 
user               | 
permissions        | list of [teamspace level permissions](#teamspace-level)

## Get permission

> Example request

```http
GET /teamspaces/repoman/permissions HTTP/1.1
```

> Example response

```json
[
	{
		"user": "breakingbad",
		"permissions": ["create_project"]
	}
]
```

### GET /teamspaces/{teamspace}/permissions

Get a list of [teamspace permission objects](#teamspace-permission-object) on this teamspace.


## Assign permissions

> Example request

```http
POST /teamspaces/repoman/permissions HTTP/1.1
```


```json
{
	"user": "breakingbad",
	"permissions": ["create_project"]
}
```

> Example response

```json
[{
	"user": "breakingbad",
	"permissions": ["create_project"]
}]
```

### POST /teamspaces/{teamspace}/permissions

Assign teamspace level permission to a user.

### Request body
[teamspace permission object](#teamspace-permission-object)


## Update permissions

> Example request

```http
PUT /teamspaces/epoman/permissions/breakingbad HTTP/1.1
```
```json
{ "permissions": ["teamspace_admin"] }
```

> Example response

```json
{ "permissions": ["teamspace_admin"] }
```

### PUT /teamspaces/{teamspace}/permissions/{user}

Update permission assigment on a user

Request body

Attribute          | Description
------------------ | ------- 
permissions        | list of [teamspace level permissions](#teamspace-level)

## Revoke permissions

> Example request

```http
DELETE /teamspaces/repoman/permissions/breakingbad HTTP/1.1
```

> Example response

```json
{}
```

### DELETE /teamspaces/{teamspace}/permissions/{user}

Revoke all permissions from a user.

