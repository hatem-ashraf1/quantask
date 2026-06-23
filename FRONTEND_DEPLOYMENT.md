# Frontend Test Deployment

This project can be shared through GitHub Pages after pushing the repository to GitHub.

## One-time GitHub setup

1. Open the repository on GitHub: `hatem-ashraf1/quantask`.
2. Go to `Settings` > `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push this branch to GitHub.
5. Open the `Actions` tab and wait for `Deploy frontend to GitHub Pages` to finish.

The frontend URL will be:

```text
https://hatem-ashraf1.github.io/quantask/
```

## Send to your friend

Share this link after the GitHub Action finishes:

```text
https://hatem-ashraf1.github.io/quantask/
```

If login or API actions fail from that link, the most likely reason is that the backend currently responds on `http://quantask.runasp.net` but not `https://quantask.runasp.net`. Browsers may block an HTTPS frontend from calling an HTTP backend. The frontend itself will still deploy, but full app testing needs the backend to support HTTPS or the frontend to be hosted somewhere that can proxy `/api` requests to the HTTP backend.

## Local check before pushing

Run:

```bash
npm run build -- --base=/quantask/
```
