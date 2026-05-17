# AI Provider

CommCalc uses the `ai-chat` Supabase Edge Function for authenticated assistant responses about deals, reps, compensation plans, quota tiers, and commissions.

## Required secrets

Set these secrets for the Supabase function runtime:

```sh
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`.

For OpenAI-compatible providers, set `OPENAI_BASE_URL` to the provider's `/v1` endpoint.

## Local development

The client app also needs standard Supabase configuration:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
