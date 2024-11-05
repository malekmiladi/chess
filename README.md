# Chess Game

## Introduction

My own take at implementing chess. This project is sort of a code improvisation challenge.

I don't know what i'm doing ... Said every engineer ever.

## How to run

You need to have go installed and typescript installed globally (refer to https://www.typescriptlang.org/download/).


After cloning the repository run:
```bash
tsc
```

next run:

```bash
go run .
```

Once the server's up and running, head to http://localhost:8000

This project is a "hobby" project, it's a work in progress, and right now there's no multiplayer feature.

## Progress

### Frontend

- [X] Implement Board representation
- [X] Implement Piece representation
- [X] Implement drawing board
- [X] Implement drawing pieces
- [X] Implement piece drag and drop
- [X] Implement move piece logic
- [X] Implement piece legal move generation
- [X] Implement en passant move
- [X] Implement pawn promotion feature
- [X] Implement castling
- [X] Implement pinned pieces logic
- [X] Implement check feature
- [ ] Implement checkmate
- [ ] Implement player
- [ ] Implement draw board for color feature
- [ ] Implement websocket messaging with backend
- [ ] Implement timer
- [ ] Implement resign feature
- [ ] Implement ask for take back feature
- [ ] Implement feature for reviewing previous states (readonly)

### Backend

- [ ] Implement new state validation
- [ ] Implement game rooms/sessions
- [ ] Implement timer