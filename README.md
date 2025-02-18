# blazenote-api (for backend)

This repository is part of the BlazeHack Workshop Series, designed to help participants build scalable, secure apps using Cloudflare services.

In this workshop, we will be using the following repos:

- Frontend repo: [blazenote](https://github.com/tve-cf/blazenote)
- Backend repo: [blazenote-api](https://github.com/tve-cf/blazenote-api)

By completing this workshop, you will have a note taking app fully integrated with image features.

## Pre-Workshop Checklist

Before the workshop, make sure you complete the following tasks:

- [ ] Create a [Cloudflare account](https://developers.cloudflare.com/fundamentals/setup/account/create-account/) using the same email you used for BlazeHack registration.
- [ ] [Install Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) in your machine.
- [ ] Create a [GitHub account](https://github.com/signup).
- [ ] [Install Git](https://github.com/git-guides/install-git) in your machine.
- [ ] Install an IDE (we recommend [Visual Studio Code](https://code.visualstudio.com/download)).

Once you’ve completed the entire checklist, you’re all set for the workshop :tada:

The **In-Workshop Activities** section outlines tasks to be completed <ins>on the day</ins> of the workshop as there will be further information provided that day.  

## In-Workshop Activities

> [!note]
> Note that you will be publishing changes to your forked repository, not the original repository.

1. [Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repo.
2. Clone the forked repository.
3. Switch to `starter` branch. This branch will be your working environment for the workshop.

### Working in Development

1. Install project dependencies - this only required if this is your first time working on the project:

    ```bash
        npm install
    ```

1. Start the local server:

    ```bash
         npm run dev
    ```

    The backend server will be accessible at: http://localhost:8787.

### Deploy app :rocket:

When you're ready to deploy the API, run the following command:

```bash
    npm run deploy
```
