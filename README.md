
## Installation & Quick Start
- Clone the repository.
```shell
git clone https://github.com/nikhilnegi95/kraftshala
```
- Install project dependencies.
```shell
cd  kraftshala
npm install
```
- install `db-migrate` module to create migrations
````shell
    sudo npm install -g db-migrate
````
- it creates a `database.json` file in root dir, edit this file and fill username and password
````shell
{
  "dev": {
    "driver": "mysql",
    "host": "localhost",
    "port": "3306",
    "user": "",
    "password": "",
    "database": "kraftshala"
  }
}
````
- run command to migrate schema file
````shell
`db-migrate up`
````
- set connection details in `./config/conn.js` file
- run server using command
````
npm start
````
