"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAIModel = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
try {
    admin.initializeApp();
}
catch (e) {
    functions.logger.info("Admin Initialization attempted more than once or failed", e);
}
exports.callAIModel = functions.https.onCall(async (data, context) => {
    // Optional: Temporarily comment out auth check for easier initial testing if client isn't sending auth context yet
    /*
    if (!context.auth) {
        functions.logger.warn('Unauthenticated request to callAIModel.');
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    */
    if (!data.prompt) {
        functions.logger.error('callAIModel called without a prompt.');
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "prompt".');
    }
    functions.logger.info(`callAIModel received - Prompt: "${data.prompt}", ModelId: "${data.modelId}"`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    const responseText = `Mocked AI response for prompt: '${data.prompt}' using model '${data.modelId}'`;
    functions.logger.info(`callAIModel returning mock: "${responseText}"`);
    return { text: responseText };
});
//# sourceMappingURL=index.js.map