# LegacyOfSpellcraft MMORPG Project

This project is a multiplayer online role-playing game (MMORPG) server built with uWebSockets.js, Redis, and MongoDB. It features zone management, player actions, and chat functionality.

## Features

- Zone Management: Handles multiple zones for player interactions.
- Player Actions: Supports various player actions and commands.
- Chat System: Implements a basic chat system for player communication.
- Database Integration: Uses MongoDB for data storage and Redis for caching.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/davydcardoso/legacy-of-spellcraft-server
   cd legacy-of-spellcraft-server
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the necessary environment variables (e.g., database connection strings, Redis configuration).

## Usage

- To start the main server:
  ```bash
  pnpm start:server
  ```
- To start a zone server:
  ```bash
  pnpm start:zone
  ```

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

