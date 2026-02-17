"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
let GameService = class GameService {
    gameState = {
        players: {},
    };
    addPlayer(id, name, avatarUrl) {
        const newPlayer = {
            id,
            name,
            position: { x: 400, y: 300 },
            avatarUrl,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        };
        this.gameState.players[id] = newPlayer;
        return newPlayer;
    }
    removePlayer(id) {
        delete this.gameState.players[id];
    }
    movePlayer(id, position) {
        if (this.gameState.players[id]) {
            this.gameState.players[id].position = position;
        }
    }
    getGameState() {
        return this.gameState;
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map