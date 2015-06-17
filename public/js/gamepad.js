/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var Gamepad = function() {
	var self = this;

	this.enabled = false;
	this.gamepad = null;
	this.timestamp = null;

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;
/*
 * Chrome Linux
		$.event.trigger("gamepadMove",
			{
				xaxis: self.gamepad.axes[0],
				yaxis: self.gamepad.axes[1],
				button: self.gamepad.buttons[0]
			}
		);
*/

		/* Chrome Canary Windows
		$.event.trigger("gamepadMove",
			{
				xaxis: self.gamepad.buttons[15].value - self.gamepad.buttons[14].value,
				yaxis: self.gamepad.buttons[13].value - self.gamepad.buttons[12].value,
				button: self.gamepad.buttons[3]
			}
		);
*/

		$.event.trigger("gamepadMove",
			{
				xaxis: self.gamepad.axes[4],
				yaxis: self.gamepad.axes[5],
				button: self.gamepad.buttons[0]
			}
		);

		if (self.gamepad.buttons[0].pressed)
			if (!self.oldButton) {
				viewer.reset();
				viewer.setNavMode('NONE');
				viewer.disableClicking();
			}

		self.oldButton = self.gamepad.buttons[0].pressed;
	};

	this.tick = function() {
		if(navigator.getGamepads()[0])
			self.gamepad = navigator.getGamepads()[0];

		if(!self.gamepad)
			viewer.setNavMode('TURNTABLE'); // Manually override navigation
		else
			self.checkStatus();

		self.nextTick();
	};

	this.nextTick = function() {
		// Only schedule the next frame if we haven’t decided to stop via
		// stopPolling() before.
		if (this.enabled) {
		  if (window.requestAnimationFrame) {
			window.requestAnimationFrame(this.tick);
		  } else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(this.tick);
		  } else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(this.tick);
		  }
		  // Note lack of setTimeout since all the browsers that support
		  // Gamepad API are already supporting requestAnimationFrame().
		}
	};

	this.stopPolling = function() {
		self.enabled = false;
	};

	this.init = function() {
		var gamepadSupportAvailable = navigator.getGamepads ||
			!!navigator.webkitGetGamepads ||
			!!navigator.webkitGamepads;

		if (gamepadSupportAvailable) {
			if ('ongamepadconnected' in window) {
				window.addEventListener('gamepadconnected', this.connected, false);
				window.addEventListener('gamepaddisconnected', this.disconnected, false);
			} else {
				this.startPolling();
			}
		}

	};
};
