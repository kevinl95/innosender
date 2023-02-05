# InnoSender


## Requirements

This was tested with `deno`'s version stated in the `.dvmrc` file, though it's possible other versions might work.

There are no other dependencies. **Deno**!

## Development

```sh
$ make start
$ make format
$ make test
```

## Structure

- Backend routes are defined at `routes.ts`.
- Static files are defined at `public/`.
- Pages are defined at `pages/`.

## Deployment

- Deno Deploy: Just push to the `main` branch. Any other branch will create a preview deployment.
