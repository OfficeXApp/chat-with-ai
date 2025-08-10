Original Repo:
https://github.com/assistant-ui/assistant-ui-starter.git

This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project.

## Getting Started

First, add your OpenAI API key to `.env.local` file:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Run in Prod

```sh
# build
npm run build
npm install pm2 -g

# run
pm2 start npm --name "my-assistant-ui" -- start

# view logs
pm2 logs my-assistant-ui
```

```sh
# restart nginx
sudo systemctl restart nginx
```

```sh
pm2 stop my-assistant-ui

pm2 delete my-assistant-ui

pm2 restart my-assistant-ui
```
