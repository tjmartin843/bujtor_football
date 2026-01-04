# Liverpool FC Stats Dashboard

A Vue.js application displaying Premier League statistics with a focus on Liverpool FC. Features the official Liverpool red and gold color scheme, real-time league table, fixtures, top scorers, and detailed team statistics.

## Features

- 🏆 **Live League Table** - Current Premier League standings with position indicators
- ⚽ **Team Statistics** - Detailed stats for Liverpool and all PL teams
- 📅 **Fixtures** - View upcoming matches and recent results
- 🥇 **Top Scorers** - League-wide scoring charts with Liverpool filter
- 📊 **Form Guide** - Visual representation of recent match results
- 🎨 **Liverpool Theme** - Official club colors (Liverbird Red & Gold)
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🐳 **Docker Ready** - Easy deployment with Docker

## Prerequisites

- Node.js 18+ (for local development)
- Docker (for containerized deployment)
- Football-Data.org API Key (free tier available)

## Getting Your API Key

1. Visit [Football-Data.org](https://www.football-data.org/client/register)
2. Register for a free account
3. Your API key will be displayed on your dashboard
4. The free tier includes:
   - Premier League data
   - 10 requests per minute
   - Basic data (fixtures, results, league tables)

## Quick Start

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd liverpool-stats

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API key to .env
# Edit .env and replace 'your_api_key_here' with your actual key
VITE_FOOTBALL_API_KEY=your_actual_api_key

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Docker Deployment

#### Production Build

```bash
# Create .env file with your API key
echo "VITE_FOOTBALL_API_KEY=your_api_key" > .env

# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build --build-arg VITE_FOOTBALL_API_KEY=your_api_key -t liverpool-stats .
docker run -d -p 3000:80 --name liverpool-stats liverpool-stats
```

The app will be available at `http://localhost:3000`

#### Development with Docker

```bash
# Run development server with hot reload
docker-compose --profile dev up liverpool-stats-dev
```

## Project Structure

```
liverpool-stats/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── LeagueTable.vue  # Premier League standings
│   │   ├── MatchCard.vue    # Match result/fixture card
│   │   ├── TeamCard.vue     # Team summary card
│   │   ├── LoadingSpinner.vue
│   │   └── ErrorMessage.vue
│   ├── views/               # Page components
│   │   ├── Home.vue         # Dashboard with Liverpool stats
│   │   ├── TeamDetail.vue   # Individual team page
│   │   ├── Fixtures.vue     # All fixtures by matchday
│   │   └── TopScorers.vue   # Scoring charts
│   ├── services/
│   │   └── api.js           # Football-Data.org API service
│   ├── App.vue              # Root component with navigation
│   ├── main.js              # App entry point with router
│   └── style.css            # Global styles with Liverpool theme
├── public/
├── Dockerfile               # Production container build
├── docker-compose.yml       # Container orchestration
├── nginx.conf               # Nginx configuration for production
├── .env.example             # Environment template
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FOOTBALL_API_KEY` | Your Football-Data.org API key | Yes |

## API Endpoints Used

The app uses the [Football-Data.org v4 API](https://www.football-data.org/documentation/api):

- `GET /competitions/PL/standings` - League table
- `GET /competitions/PL/matches` - All fixtures
- `GET /competitions/PL/scorers` - Top scorers
- `GET /teams/{id}` - Team details
- `GET /teams/{id}/matches` - Team fixtures

## Color Scheme

The app uses Liverpool FC's official colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Liverbird Red | `#C8102E` | Primary accent, headers |
| Gold | `#F6EB61` | Highlights, active states |
| Dark Red | `#9B0A20` | Gradients, hover states |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes. Liverpool FC branding is property of Liverpool Football Club.

## Acknowledgments

- [Football-Data.org](https://www.football-data.org/) for the free API
- [Vue.js](https://vuejs.org/) for the framework
- [Vite](https://vitejs.dev/) for the build tool
- Liverpool FC for the inspiration ⚽

---

**You'll Never Walk Alone** 🔴
