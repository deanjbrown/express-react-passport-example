# Express, React, Dizzle, Dockerized Postgresql, and Passport example

This is a simple starting point for an app with an Express backend, React frontend, Dizzle for the ORM, and a dockerized PostgreSQL database. Passport is already configured and so are some basic routes for user and post CRUD (Create, Retrieve, Update and Delete). There is also a simple implementation of RBAC (Role Based Access Control).

## Development

**Features currently in development**
- Adding rate limiting
- Adding CSRF protection
- Adding email verification
- Creating a frontend to interact with the backend

To contribute to the development or to customize the application:

Fork the repository.
Create a new branch.
Make your changes and submit a pull request.

### Recommended IDE Setup for development

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Project Setup

### Run in Development mode

```bash
# Start the dockerized postgresql database
cd database
docker compose up -d

# Generate and apply migrations
cd ../backend
npm run db:update

# Seed the database with dummy data
npm run db:seed

# Create an admin user
npm run create-admin

# Run drizzle studio
npm run db:studio

# Run the backend in dev mode
npm run dev

# Run the frontend in dev mode
cd ../frontend
npm run dev
```

Happy coding!

## License

This project is licensed under the MIT License.

### MIT License

The MIT License (MIT)

Copyright (c) [2025] [Dean Brown]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.





