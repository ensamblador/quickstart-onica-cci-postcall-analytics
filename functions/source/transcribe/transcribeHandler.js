"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.handler = exports.createOrUpdateVocabulary = exports.getAudioMetadata = exports.doesVocabularyExist = exports.extractBucketParams = void 0;
require("source-map-support/register");
var aws_sdk_1 = require("aws-sdk");
var s3_1 = require("@music-metadata/s3");
var FileType = require("file-type");
var transcribeService = new aws_sdk_1.TranscribeService({ apiVersion: '2017-10-26' });
var documentClient = new aws_sdk_1.DynamoDB.DocumentClient();
var s3 = new aws_sdk_1.S3({ apiVersion: '2006-03-01' });
exports.extractBucketParams = function (event) { return event.Records
    .map(function (_a) {
    var s3 = _a.s3;
    return ({
        name: s3.bucket.name,
        key: s3.object.key,
        type: s3.object.key.includes('txt') ? 'text' : 'audio',
        size: s3.object.size
    });
}); };
exports.doesVocabularyExist = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, transcribeService.getVocabulary({
                        VocabularyName: process.env.CUSTOM_VOCABULARY_NAME
                    }).promise()];
            case 1:
                _a.sent();
                return [2 /*return*/, true];
            case 2:
                e_1 = _a.sent();
                if (e_1.message === "The requested vocabulary couldn't be found. Check the vocabulary name and try your request again.") {
                    return [2 /*return*/, false];
                }
                else {
                    throw e_1;
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAudioMetadata = function (s3Object) { return __awaiter(void 0, void 0, void 0, function () {
    var params, stream, mimeType, meta, metadata;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    Bucket: s3Object.name,
                    Key: decodeURIComponent(s3Object.key)
                };
                stream = s3.getObject(params).createReadStream();
                return [4 /*yield*/, FileType.fromStream(stream)];
            case 1:
                mimeType = _a.sent();
                return [4 /*yield*/, s3.headObject(params).promise()];
            case 2:
                meta = _a.sent();
                return [4 /*yield*/, s3_1.parseS3Object(s3, params, {
                        disableChunked: true
                    })];
            case 3:
                metadata = _a.sent();
                console.log(metadata.format);
                stream.destroy();
                return [2 /*return*/, __assign(__assign({}, s3Object), { format: mimeType.ext, numberOfChannels: metadata.format.numberOfChannels, meta: meta.Metadata })];
        }
    });
}); };
exports.createOrUpdateVocabulary = function (vocab) { return __awaiter(void 0, void 0, void 0, function () {
    var params, exists;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    LanguageCode: 'es-US',
                    VocabularyName: process.env.CUSTOM_VOCABULARY_NAME,
                    VocabularyFileUri: "s3://" + vocab.name + "/" + vocab.key
                };
                return [4 /*yield*/, exports.doesVocabularyExist()];
            case 1:
                exists = _a.sent();
                if (!exists) return [3 /*break*/, 3];
                console.log('Updating Vocabulary');
                return [4 /*yield*/, transcribeService.updateVocabulary(params).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, transcribeService.createVocabulary(params).promise()];
            case 4:
                _a.sent();
                console.log('Creating Vocabulary');
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var objectParams, vocab, s3Objects, paramMap, tableUpdates, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                objectParams = exports.extractBucketParams(event);
                console.log(objectParams);
                vocab = objectParams.find(function (params) { return params.type === 'text'; });
                if (!vocab) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.createOrUpdateVocabulary(vocab)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [4 /*yield*/, Promise.all(objectParams.filter(function (params) { return params.type === 'audio'; }).map(function (params) { return exports.getAudioMetadata(params); }))
                // get bucket paths for all event-sourced objects
            ];
            case 3:
                s3Objects = _a.sent();
                paramMap = s3Objects
                    .filter(function (params) { return params.type === 'audio'; })
                    .map(function (params) {
                    var transcriptionJob = {
                        LanguageCode: 'es-US',
                        Media: {
                            MediaFileUri: decodeURIComponent("s3://" + params.name + "/" + params.key)
                        },
                        TranscriptionJobName: decodeURIComponent(params.key),
                        MediaFormat: params.format,
                        OutputBucketName: process.env.TRANSCRIBE_OUTPUT_BUCKET
                    };
                    if (params.numberOfChannels > 1) {
                        transcriptionJob = __assign(__assign({}, transcriptionJob), { Settings: {
                                ChannelIdentification: true,
                                ShowSpeakerLabels: false
                            } });
                    }
                    else {
                        transcriptionJob = __assign(__assign({}, transcriptionJob), { Settings: {
                                ChannelIdentification: false,
                                ShowSpeakerLabels: true,
                                MaxSpeakerLabels: 2
                            } });
                    }
                    var customVocabulary = process.env.CUSTOM_VOCABULARY_NAME;
                    if (customVocabulary && customVocabulary !== '') {
                        console.log("Using custom vocabulary: " + customVocabulary);
                        return __assign(__assign({}, transcriptionJob), { Settings: __assign(__assign({}, transcriptionJob.Settings), { VocabularyName: customVocabulary }) });
                    }
                    return transcriptionJob;
                });
                // start all transcription jobs
                return [4 /*yield*/, Promise
                        .all(paramMap.map(function (params) { return transcribeService.startTranscriptionJob(params).promise(); }))];
            case 4:
                // start all transcription jobs
                _a.sent();
                console.log(s3Objects);
                tableUpdates = s3Objects.map(function (r, i) { return documentClient.update({
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        jobId: r.meta.jobid,
                        lastModified: r.meta.lastmodified
                    },
                    ExpressionAttributeNames: {
                        '#status': 'status',
                        '#transcriptionJobName': 'transcriptionJobName'
                    },
                    ExpressionAttributeValues: {
                        ':st1': 1,
                        ':tjn': decodeURIComponent(s3Objects[i].key) + ".json"
                    },
                    UpdateExpression: 'set #status = :st1, #transcriptionJobName = :tjn',
                    ReturnValues: 'ALL_NEW'
                }).promise(); });
                return [4 /*yield*/, Promise.all(tableUpdates)];
            case 5:
                updated = _a.sent();
                console.log({
                    statusCode: 200,
                    jobStatus: updated.map(function (res) { return res.Attributes; })
                });
                return [2 /*return*/];
        }
    });
}); };
