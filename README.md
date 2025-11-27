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

## Socket Events
##### The server listens for the following socket events:
- `auth:set`: Authenticate and set player information.
   ```bash
   { "type": "auth:set", "payload": { "charId": "char-uuid-123", "name": "Harry", "pos": { "x": 10, "y": 20 } } }
   ```
- `zone:enter`: Enter a specified zone.
   ```bash
   { "type": "zone:enter", "payload": { "zoneId": "hogwarts_hall", "pos": { "x": 1, "y": 1 } } }
   ```
- `player:action`: Perform a player action.
   ```bash
   { "type": "player:action", "payload": { "action": "cast_spell", "spellId": 2, "targetId": "char-uuid-999" } }
   ```
- `chat:message`: Send a chat message.
   ```bash
   { "type": "chat:msg", "payload": { "channel": "zone", "text": "I found a secret chest" } }
   ```
- `spell:cast`: Cast a spell in the game.
- `player:move`: Move the player to a new position.

- `item:use`: Use an item from the inventory.
- `item:trade`: Trade items with another player.
- `npc:interact`: Interact with a non-player character (NPC).
- `quest:update`: Update quest status.
- `logout`: Log out the player from the server.



## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.


