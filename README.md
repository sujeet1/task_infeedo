## Task for Infeedo

####Installation

1. Install Nodejs, npm and PostgreSQL (you can you docker as well)

2  clone git repo from https://github.com/sujeet1/task_infeedo

```bash
$ git clone https://github.com/sujeet1/task_infeedo
```

3. make change to .env and ormconfig.json with postgresSQL credentials and port for API

4. install node dependencies 
```bash
$ npm install 
```

5. Run the server for REST API's
```bash
$ npm start
```
Check API at http://localhost:3000/v1/task



To Run unit test cases
```bash
$ npm test
```