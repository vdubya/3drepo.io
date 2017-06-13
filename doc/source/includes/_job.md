# Job

## Job object

Attribute | Description
--------- | ------------------
_id       | job name
color     | job color, RGB hex values

## Get all jobs

> Example request

```http
GET /teamspaces/repoman/jobs HTTP/1.1
```

> Example response

```json
[
	{
		"_id": "chef",
		"color": "#000000"
	},
	{
		"_id": "distributor",
		"color": "#111111"
	}
]
```

### GET /teamspaces/{teamspace}/jobs

Get a list of [job objects](#job-object) belongs to this teamspace.

## Create a job

> Example request

```http
POST /teamspaces/repoman/jobs HTTP/1.1
```
```json
{
	"_id": "driver",
	"color": "#111111"
}
```

> Example response

```json
[
	{
		"_id": "driver",
		"color": "#111111"
	}
]
```

### POST /teamspaces/{teamspace}/jobs

Create a job for this teamspace

Request body
[Job object](#job-object)

## Delete a job

> Example request

```http
DELETE /teamspaces/repoman/jobs/driver HTTP/1.1
```
> Example response

```json
{}
```

### DELETE /teamspaces/{teamspace}/jobs/{jobId}

Delete a job from a teamspace

### URL parameters

Parameter | Required | Description
--------- | ------- | -------
jobId | Yes | job ID to be deleted