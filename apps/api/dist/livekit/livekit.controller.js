"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivekitController = void 0;
const common_1 = require("@nestjs/common");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LivekitController = class LivekitController {
    async getToken(room, username) {
        const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
        const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
        const wsUrl = process.env.LIVEKIT_URL || 'wss://your-livekit-url.io';
        const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
            identity: username,
        });
        at.addGrant({ roomJoin: true, room: room });
        return {
            token: await at.toJwt(),
            url: wsUrl,
        };
    }
};
exports.LivekitController = LivekitController;
__decorate([
    (0, common_1.Get)('token'),
    __param(0, (0, common_1.Query)('room')),
    __param(1, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LivekitController.prototype, "getToken", null);
exports.LivekitController = LivekitController = __decorate([
    (0, common_1.Controller)('livekit')
], LivekitController);
//# sourceMappingURL=livekit.controller.js.map