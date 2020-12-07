# TODO README
TODO some general readme

# Local database setup
The deployment database is managed by Heroku along with its connection credentials, which will be provided in the environment variable `DATABASE_URL`.
For local development, the following is recommended:
1. Run a docker container with postgres database as follows:
```bash
docker run --name wfh-db -e POSTGRES_PASSWORD=password -d -p 8765:5432 postgres 
```
(The default port for postgres is `5432`, but as it is in use on my machine I use `8765`)
It is important to set `sslmode=disable`, as the docker container won't provide ssl.
1. Log into the docker container and create the database `wfhtool` using
```bash
docker exec -it wfh-db psql -U postgres
```
and
```
CREATE DATABASE wfhtool;
```
1. Provide the following connection string to the server via environment variable:
```bash
export DATABASE_URL=postgres://postgres:password@localhost:8765/wfhtool?sslmode=disable
```
1. Start the server locally with `heroku local`

```
You can stop the database container with 
```bash
docker stop wfh-db
```
and start it again, preserving the database, with
```bash
docker start wfh-db
```
To delete the database and lose all state, simply remove the container after stopping it, usin
```bash
docker rm wfh-db
```
