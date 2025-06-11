# ForgeDB - Minecraft Mods Review Platform

A modern web application for reviewing and managing Minecraft mod compatibility information.

## Features

- User authentication with Discord
- Mod reviews and compatibility tracking
- User profiles with custom avatars
- Review reactions system (likes/dislikes)
- Mod conflict tracking
- Admin dashboard for content moderation

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- NextAuth.js
- Shadcn/ui Components

## Deployment on Vercel

1. Fork or clone this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Configure environment variables:

Required environment variables:
```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

### Environment Variables Setup on Vercel

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add the following variables:
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `DISCORD_CLIENT_ID`: From Discord Developer Portal
   - `DISCORD_CLIENT_SECRET`: From Discord Developer Portal

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/discord`
5. Copy Client ID and Client Secret to your environment variables

## Project Structure

```
├── src/
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # React components
│   ├── types/           # TypeScript types
│   └── lib/             # Utility functions
├── public/              # Static files
├── data/               # JSON data files
└── ...config files
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details
