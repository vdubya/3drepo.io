/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = (() => {
	"use strict";

	// Winston logger and Short ID imports
	const winston = require("winston");
	const shortid = require("shortid");

	// 3D Repo config and constants
	const C = require("./constants");

	/**
	 * [RepoCustomLevels List of logging levels: error, warn, info, debug, trace]
	 * @type {Object}
	 */
	const RepoCustomLevels = {
		levels: {},
		colors: {}
	};

	RepoCustomLevels.levels[C.LOG_ERROR] = 0;
	RepoCustomLevels.levels[C.LOG_WARN] = 1;
	RepoCustomLevels.levels[C.LOG_INFO] = 2;
	RepoCustomLevels.levels[C.LOG_DEBUG] = 3;
	RepoCustomLevels.levels[C.LOG_TRACE] = 4;

	RepoCustomLevels.colors[C.LOG_ERROR] = "red";
	RepoCustomLevels.colors[C.LOG_TRACE] = "magenta";
	RepoCustomLevels.colors[C.LOG_INFO] = "yellow";
	RepoCustomLevels.colors[C.LOG_WARN] = "blue";
	RepoCustomLevels.colors[C.LOG_DEBUG] = "white";

	/**
	 * [RepoLogger Internal logger factory]
	 * @param {Request} req [Express request object]
	 * @param {String} consoleLevel [Level of console logging]
	 * @param {String} fileLevel [Level of file logging (null disables file logging)]
	 * @param {String} fileName [File name to log to]
	 * @param {String}  id  [Unique logging ID, if omitted a short ID is generated]
	 */
	var RepoLogger = function (req, consoleLevel, fileLevel, fileName, id) {
		var self = this instanceof RepoLogger ? this : Object.create(RepoLogger.prototype);

		// If an ID is provided then use it, otherwise generate one.
		if (id === undefined) {
			self.uid = shortid.generate();
		} else {
			self.uid = id;
		}

		// Set-up logging transports (console and/or file)
		const transports = [];

		transports.push(new(winston.transports.Console)({
			colorize: true,
			level: consoleLevel,
		}));

		if (fileLevel) {
			transports.push(new(winston.transports.File)
				({
					level: fileLevel,
					filename: fileName
				})
			);
		}

		self.logger = new(winston.Logger)({
			levels: RepoCustomLevels.levels,
			colors: RepoCustomLevels.colors,
			transports: transports
		});

		// Set the time the object is initialized
		self.startTime = (new Date()).getTime();

		return self;
	};

	/**
	 * [logMessage Generic message logging function with timing function ]
	 * @param  {String} type [Type of log matching one of defined error levels]
	 * @param  {String} msg  [Message to be logged]
	 */
	RepoLogger.prototype.logMessage = function (type, msg) {
		var currentTime = (new Date()).getTime();
		var timeDiff = currentTime - this.startTime;

		this.logger.log(type, (new Date()).toString() + "\t" + this.uid + "\t" + msg + " [" + timeDiff + " ms]");
	};

	/**
	 * [logInfo Log an information message ]
	 * @param  {String} msg  [Message to be logged]
	 */
	RepoLogger.prototype.logInfo = function (msg) {
		this.logMessage(C.LOG_INFO, msg);
	};

	/**
	 * [logError Log an error message ]
	 * @param  {String} msg  [Message to be logged]
	 */
	RepoLogger.prototype.logError = function (msg) {
		this.logMessage(C.LOG_ERROR, msg);
	};

	/**
	 * [logDebug Log a debug message ]
	 * @param  {String} msg  [Message to be logged]
	 */
	RepoLogger.prototype.logDebug = function (msg) {
		this.logMessage(C.LOG_DEBUG, msg);
	};

	/**
	 * [logWarning Log a warning message ]
	 * @param  {String} msg [Message to be logged]
	 */
	RepoLogger.prototype.logWarning = function (msg) {
		this.logMessage(C.LOG_WARN, msg);
	};

	/**
	 * [logTrace Log a trace message ]
	 * @param  {String} msg  [Message to be logged]
	 */
	RepoLogger.prototype.logTrace = function (msg) {
		this.logMessage(C.LOG_TRACE, msg);
	};

	/**
	 * [LoggerObject Returned from the logger constructor]
	 * @type {Object}
	 */
	var LoggerObject = {};

	// Middleware exposure of logger 

	/**
	 * [startRequest Called at the start of a request to initialize a personal logger]
	 * @param  {Request}   req  [Express request object]
	 * @param  {Response}  res  [Express response object]
	 * @param  {Function}  next [Function next in the middleware]
	 */
	LoggerObject.startRequest = function (req, res, next) {
		// Only import config on the first request, means system logger
		// is always available even without config
		const config = require("./config.js");

		req[C.REQ_REPO] = {};
		req[C.REQ_REPO].logger = new RepoLogger(req, config.logfile.console_level, config.logfile.file_level, config.logfile.filename); // Create logger for this request
		req[C.REQ_REPO].logger.logInfo("BEGIN " + req.method + " " + req.url);

		next();
	};

	/**
	 * [endRequest Called at the end of a request to logger time taken]
	 * @param  {Request} req [Express request object]
	 */
	LoggerObject.endRequest = function (req) {
		req[C.REQ_REPO].logger.logInfo("END " + req.method + " " + req.url);
	};

	/**
	 * [systemLogger System logger to use when not in a request]
	 * @type {RepoLogger}
	 */
	LoggerObject.systemLogger = new RepoLogger(null, C.LOG_TRACE, null, null, C.LOG_SYSTEM);

	return LoggerObject;

}());