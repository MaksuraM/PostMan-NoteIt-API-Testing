
# NoteIt API Testing Assignment

This project is designed to test your API testing skills using **Postman** or any other HTTP client. The API testing assignment involves testing a RESTful API for a note-taking application called **NoteIt**. The application allows users to manage notes through various API endpoints, including creating, updating, sharing, and searching for notes.

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Test Flow](#test-flow)
- [Running the Tests](#running-the-tests)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

This API testing assignment focuses on testing the **NoteIt** application, which is a **note-taking application** that offers the following functionality:

- **Register and Login**: Users can register and log in with email/password.
- **Create, Read, Update, and Delete Notes**: Users can perform CRUD (Create, Read, Update, Delete) operations on their notes.
- **Share Notes**: Users can share notes with other users.
- **Search Notes**: Users can search for notes by title.
- **Bookmark Notes**: Users can bookmark both their own and shared notes.
- **Bookmark Management**: Users can remove bookmarks and manage the list of bookmarked notes.

The objective of this assignment is to create a test flow that covers the entire user journey using Postman. The API endpoints are tested for different use cases and their expected outcomes.

## Prerequisites

Before you can run the tests, you will need the following:

- **Postman** or any other HTTP client for API testing.
- The **NoteIt API** up and running locally or on a development server.

### Base URL

- **Local**: `http://localhost:5000/api`
- **Dev**: `https://z3a3qqyhle.execute-api.ca-central-1.amazonaws.com/dev/api`

## Authentication

The **NoteIt API** uses **JWT (JSON Web Token)** for authentication. After registering or logging in, you will receive an access token that should be included in the **Authorization header** for authenticated requests.

```bash
Authorization: Bearer <your_access_token>
```

## Test Flow

This assignment requires creating a test flow that covers the entire **user journey** with the following steps:

1. **Register a new user**.
2. **Login** to the application.
3. **Create a note**.
4. **Update the note**.
5. **Share the note** with another user.
6. **Bookmark the note**.
7. **Search for the note** by title.
8. **Get bookmarked notes**.
9. **Remove the bookmark** from the note.
10. **Delete the note**.

### Test Scenarios

- **Registration and Login**: Test the registration and login API endpoints with valid and invalid credentials.
- **CRUD Operations on Notes**: Ensure that notes can be created, updated, and deleted.
- **Sharing and Bookmarking**: Test sharing functionality and ensure notes can be bookmarked.
- **Search and Get Bookmarked Notes**: Validate search functionality and retrieving bookmarked notes.
- **Token Authentication**: Ensure the JWT token is included in the request headers for authenticated endpoints.

## Running the Tests

You can run the Postman API tests locally using **Newman**. To do this, follow these steps:

### 1. Install Dependencies

If you don't have **Newman** installed, you can install it globally using npm:

```bash
npm install -g newman
```

### 2. Run the Tests

After installing the required dependencies, execute the following command to run the Postman tests:

```bash
newman run postman/collection.json --environment postman/environment.json
```

This will run the API tests defined in the `collection.json` file against the API defined in `environment.json`.

## GitHub Actions CI/CD

This repository uses **GitHub Actions** for continuous integration (CI) and continuous deployment (CD). The workflow triggers automatically on pushes to the `main` branch or pull requests.

### Workflow Configuration

The `.github/workflows/postman-tests.yml` file contains the GitHub Actions configuration. The workflow includes the following steps:

1. **Checkout the repository**.
2. **Set up Node.js**.
3. **Install dependencies** using `npm install`.
4. **Run the Postman collection with Newman**.

Here is the workflow definition:

```yaml
name: Run Postman API Tests with Newman

on:
  workflow_dispatch:  # Enables manual trigger from GitHub UI
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  newman:
    runs-on: self-hosted  # Ensures it runs on the self-hosted runner

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      - name: Install dependencies
        run: |
          npm install

      - name: Run Postman Collection with Newman
        run: |
          newman run postman/collection.json --environment postman/environment.json
```

To trigger the workflow manually, go to the **Actions** tab in your GitHub repository and click the **Run workflow** button.

## Contributing

If you'd like to contribute to this project, feel free to fork the repository, make your changes, and submit a pull request. We welcome contributions for additional tests, improvements, or bug fixes!

### Steps for Contributing:
1. Fork the repository.
2. Clone your forked repository locally.
3. Create a new branch.
4. Make your changes.
5. Push the changes and create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
