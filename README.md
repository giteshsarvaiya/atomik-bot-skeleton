# Atomik Discord Bot Skeleton

A production-ready Discord bot skeleton built with Node.js, featuring autoloading commands/events, SQLite database, and graceful error handling.

## 🚀 Features

- **ES Modules**: Modern JavaScript with import/export syntax
- **Autoloading via Barrels**: Commands and events exported through barrel files for simple registration
- **Slash Commands**: Modern Discord slash command implementation
- **Database Persistence**: SQLite database with migrations for guild settings
- **Graceful Degradation**: Bot continues working even if bound channels/users are missing
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Modern Architecture**: Clean, modular code structure following best practices

## 📋 Commands

### `/bind <resource> ...`
Bind a resource to a channel or a user. Saves the ID (not the name) to the database.

**Supported Resources:**
- `stats_channel` → requires a channel option
- `leaderboard_channel` → requires a channel option
- `admin_role` (Admin - User) → requires a user option (stored in `admin_role_id`)

**Usage Examples:**
```
/bind resource:Stats Channel channel:#stats
/bind resource:Leaderboard Channel channel:#leaderboard
/bind resource:Admin (User) user:@Moderator
```

### `/status`
Shows current bindings and their status. Warns about missing channels/users.

### `/leaderboard`
Posts mocked leaderboard data to the bound leaderboard channel. Warns if no channel is bound.

### `/ping-stats`
Sends "pong" to the bound stats channel. Warns if no channel is bound.

## 🛠️ Setup

### Prerequisites
- Node.js 18+ (ES modules support)
- Discord Bot Token
- Discord Application Client ID

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd atomik-bot-skeleton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your Discord credentials
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   ```

4. **Database Setup**
   ```bash
   npm run migrate
   ```

5. **Start the bot**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Schema

The bot uses SQLite with the following table structure:

```sql
CREATE TABLE guild_settings (
    guild_id TEXT PRIMARY KEY NOT NULL,
    stats_channel_id TEXT,
    leaderboard_channel_id TEXT,
    admin_role_id TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Note: For the admin binding we currently store a user ID in `admin_role_id`.

## 📁 Project Structure

```
atomik-bot-skeleton/
├── src/
│   └── index.js              # Main entry point
├── discord/
│   ├── commands/
│   │   ├── index.js          # Barrel file exporting all commands
│   │   ├── bind.js
│   │   ├── status.js
│   │   ├── leaderboard.js
│   │   └── ping-stats.js
│   └── events/
│       ├── index.js          # Barrel file exporting all events
│       ├── ready.js
│       ├── interactionCreate.js
│       ├── channelDelete.js
│       ├── channelUpdate.js
│       ├── guildCreate.js
│       ├── guildDelete.js
│       └── messageCreate.js
├── db/
│   ├── database.js           # Database connection & setup
│   └── migrations/
│       └── 001_create_guild_settings.sql
├── config/
│   ├── env.js                # Environment validation
│   └── constants.js          # Bot constants
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── .github/workflows/ci.yml  # CI workflow
└── package.json
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start bot with nodemon (auto-restart on changes)
- `npm start` - Start bot in production mode
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run database migrations

### Code Quality

The project uses:
- **ESLint** for code linting and quality checks
- **Prettier** for consistent code formatting
- **GitHub Actions** for automated CI/CD

### Adding New Commands

1. Create a new file in `discord/commands/`
2. Export an object with `data` (SlashCommandBuilder) and `execute` (function)
3. The command will be automatically loaded on startup

## 🔔 Event Logging
The bot logs these events to the console:
- `channelDelete`, `channelUpdate`
- `guildCreate`, `guildDelete`
- `messageCreate`
- All `interactionCreate` events (with command name when applicable)

1. Create a new file in `discord/events/`
2. Export an object with `name` (event name) and `execute` (function)
3. Use `once: true` for one-time events, omit for recurring events

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | Yes |
| `DISCORD_CLIENT_ID` | Your Discord application client ID | Yes |

### Bot Permissions

The bot requires the following Discord permissions:
- Manage Guild (for binding commands)
- Send Messages
- Use Slash Commands
- Read Message History

## 🚨 Error Handling

The bot implements comprehensive error handling:

- **Missing Channels/Roles**: Gracefully degrades with warnings
- **Database Errors**: Logs errors and continues operation
- **Command Errors**: User-friendly error messages
- **Process Errors**: Graceful shutdown on critical errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your Discord bot permissions
3. Ensure all environment variables are set
4. Check that the database migrations ran successfully

## 🔮 Future Enhancements

Potential improvements for the skeleton:
- User permission system
- More resource types
- Web dashboard for configuration
- Analytics and logging
- Plugin system for custom commands
