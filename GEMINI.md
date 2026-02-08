# GEMINI.md

## Project Overview

This project, `private-isu`, is a practice environment for the ISUCON web performance tuning contest. It provides a web application with multiple language implementations, a benchmarker to test performance, and tools for provisioning the necessary infrastructure. The goal is to optimize the application to achieve the highest score from the benchmarker.

The main components are:
- **`webapp/`**: Contains the source code for the web application in Ruby, Go, PHP, Python, and Node.js.
- **`benchmarker/`**: Contains the source code for the performance testing tool.
- **`provisioning/`**: Contains Ansible playbooks for setting up the environment on cloud instances.

## Building and Running

The recommended way to run the application is using Docker Compose.

**Prerequisites:**
- Docker and Docker Compose
- `bunzip2` command-line tool

**1. Initial Setup:**

First, prepare the initial data by running the following command in the project root:

```sh
make init
```

This will download and extract the SQL data and image assets.

**2. Running the Application:**

Navigate to the `webapp` directory and start the application using Docker Compose:

```sh
cd webapp
docker compose up
```

This will start the following services:
- `nginx`: Web server on port 80.
- `app`: The application server (defaults to the PHP implementation).
- `mysql`: MySQL database on port 3306.
- `memcached`: Memcached server.

**3. Running the Benchmarker:**

The benchmarker is a command-line application that runs a series of scenarios against the web application to test its performance and correctness. It measures the score based on the number of successful and failed requests.

Before running the benchmark, the application is initialized by sending a `GET` request to the `/initialize` endpoint.

**Using Docker:**
```sh
cd benchmarker
docker build -t private-isu-benchmarker .
# For Mac
docker run --network host -i private-isu-benchmarker /bin/benchmarker -t http://host.docker.internal -u /opt/userdata
# For Linux
docker run --network host --add-host host.docker.internal:host-gateway -i private-isu-benchmarker /bin/benchmarker -t http://host.docker.internal -u /opt/userdata
```

**Using local Go environment:**
```sh
cd benchmarker
make
./bin/benchmarker -t "http://localhost:80" -u ./userdata
```

The output is a JSON object with the following fields:
- `pass`: `true` if the benchmark was successful, `false` otherwise.
- `score`: The final score.
- `success`: The number of successful requests.
- `fail`: The number of failed requests.
- `messages`: A list of error messages.

## Development Conventions

### Switching Application Language

To switch the language implementation, edit the `webapp/compose.yml` file. In the `app` service definition, change the `build.context` to one of the following directories:

- `ruby/`
- `golang/`
- `php/`
- `python/`
- `node/`

After changing the context, rebuild the application container:

```sh
cd webapp
docker compose up --build
```

For PHP, there's a specific `make` target to handle the nginx configuration change:
```sh
make php-init
```

### Database

The application uses MySQL. The connection details are configured in `webapp/compose.yml` via environment variables passed to the `app` service. The initial data is loaded from `webapp/sql/dump.sql` when the `mysql` service starts for the first time.

### Caching

The application uses Memcached for caching. The address is configured in `webapp/compose.yml` via an environment variable passed to the `app` service.

### Ruby Implementation Details

The Ruby implementation is a Sinatra application located in `webapp/ruby/app.rb`.

- **Dependencies:** It uses the `mysql2` gem for database access and `rack-session-dalli` for session storage with Memcached.
- **Performance:** The `make_posts` helper method in `app.rb` is a good example of a performance bottleneck. It contains N+1 queries, where it iterates through posts and makes separate database calls for each post to retrieve associated comments and user data. Optimizing this part of the code is a key challenge.
