# 🦒 Giraffael 🦒

**Long, but not alone.**

## Status: Active Development

Giraffael is the latest iteration of my chat application and the primary repository for ongoing development.

## Project History

- **Giraffael-Archive** — Initial implementation (archived).
- **Giraffael2-Archive** — Second iteration (archived).
- **Giraffael** — Current implementation (actively maintained).

## Prerequisites

Before getting started, make sure the following dependencies are installed:

- [Node.js](https://nodejs.org/en/download)
- [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)

## Getting Started (macOS)

Follow these steps to run the application locally:

1. Navigate to the project directory (`socket-chat`).

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Make the startup script executable (if it isn't already):

   ```bash
   chmod +x start-app.sh
   ```

4. Start the application:

   ```bash
   ./start-app.sh
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Testing

The project includes automated tests for several functionalities. Run the following command to execute the test suite:

```bash
npm test
```
