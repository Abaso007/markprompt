<a href="https://markprompt.com">
  <img alt="Markprompt – AI for customer support" src="https://raw.githubusercontent.com/motifland/markprompt/main/public/static/cover.png">
  <h1 align="center">Markprompt</h1>
</a>

Markprompt is an AI-native platform for customer support. Connect any source of content (Salesforce, Zendesk, Notion, GitHub, and more) and use as foundation for applications to automate and scale support operations: bespoke ChatGPT tuned to your company's content and brand, AI draft responses for faster case resolution, centralized access to expert knowledge updated in real time, and AI-powered customer insights.

<br />
<br />

<p align="center">
  <a href="https://x.com/markprompt">
    <img alt="X" src="https://img.shields.io/twitter/follow/markprompt?style=flat&label=%40markprompt&logo=twitter&color=0bf&logoColor=fff" />
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/markprompt">
    <img alt="NPM version" src="https://badgen.net/npm/v/markprompt">
  </a>
  <a aria-label="License" href="https://github.com/motifland/markprompt/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-blue.svg">
  </a>
</p>

## Deploying

When reploying, make sure to run the following steps:

### Nango

Deploy Nango syncs:

```sh
cd external/nango-integrations
nango deply prod
```

### Inngest

Deploy Inngest to production:

```sh
curl -X PUT https://markprompt.com/api/inngest
```

## Documentation

To use the Markprompt platform as is, please refer to the [Markprompt documentation](https://markprompt.com/docs).

Markprompt is built on top of the following stack:

- [Next.js](https://nextjs.org/) - framework
- [Vercel](https://vercel.com/) - hosting
- [Supabase](https://supabase.com/) - database and auth
- [Upstash](https://upstash.com/) - Redis and rate limiting
- [Typescript](https://www.typescriptlang.org/) - language
- [Tailwind](https://tailwindcss.com/) - CSS
- [Stripe](https://stripe.com/) - payments.

## Using the React and Web components

Markprompt comes with React and Web components that make it easy to build a prompt interface on top of the Markprompt API. With a single line of code, you can provide a prompt interface to your React application. Follow the steps in the [Markprompt docs](https://markprompt.com/docs#components) to get started, or explore the [source code](https://github.com/motifland/markprompt-js).

Also, try out the [Markprompt starter template](https://github.com/motifland/markprompt-starter-template) for a fully working Next.js + Tailwind project.

## Data retention

OpenAI keeps training data for 30 days. Read more: [OpenAI API data usage policies](https://openai.com/policies/api-data-usage-policies).

Markprompt keeps the data as long as you need to query it. If you remove a file or delete a project, all associated data will be deleted immediately.

## Community

- [X](https://x.com/markprompt)
- [Discord](https://discord.gg/MBMh4apz6X)

## License

[Apache](./LICENSE) © [Markprompt](https://markprompt.com)
