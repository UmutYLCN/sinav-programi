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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./enums"), exports);
__exportStar(require("./schemas/common"), exports);
__exportStar(require("./schemas/faculty"), exports);
__exportStar(require("./schemas/department"), exports);
__exportStar(require("./schemas/course"), exports);
__exportStar(require("./schemas/room"), exports);
__exportStar(require("./schemas/instructor"), exports);
__exportStar(require("./schemas/exam-group"), exports);
__exportStar(require("./schemas/exam-invigilator"), exports);
__exportStar(require("./schemas/exam-conflict"), exports);
__exportStar(require("./schemas/exam"), exports);
__exportStar(require("./schemas/unavailability"), exports);
__exportStar(require("./schemas/user"), exports);
__exportStar(require("./schemas/invigilator-load"), exports);
//# sourceMappingURL=index.js.map