/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";

    function PingNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        var node = this;

		this.on("input", function (msg) {
			var host = msg.host || node.host;
			var tout = 5;  // timeout in secs for every ping
			var delta = 25;  // time in msecs to wait between pings
			var compact_format = true;  // indicate the kind of object to return - compact means only delay in an array
			var sent = false;

			// Promise function to return ping delay object of host 'value'
			var MapPing = function (value) {
				return new Promise(function(resolve, reject) {
					if (typeof(value) == 'undefined') resolve(null);

					var spawn = require('child_process').spawn;
					var plat = require('os').platform();
					var ex;
					const opt = {detached: true, timeout: tout*1000};

					if (plat == "linux") { ex = spawn('ping', ['-n', '-w', tout.toString(), '-c', '1', value], opt); }
					else if (plat.match(/^win/)) { ex = spawn('ping', ['-n', '1', '-w', (1000*tout).toString(), value], opt); }
					else if (plat == "darwin") { ex = spawn('ping', ['-n', '-t', tout.toString(), '-c', '1', value], opt); }
					else { node.error("Sorry - your platform - "+plat+" - is not recognised."); }
					var res = false;
					var line = "";
					//var regex = /from.*time.(.*)ms/;
					var regex = /=.*[<|=]([0-9]*).*TTL|ttl..*=([0-9\.]*)/;
					ex.stdout.on('data', function (data) {
						line += data.toString();
					});
					ex.stderr.on('data', function (data) {
						//node.error('[ping] stderr: ' + data);
						reject(Error('[ping] stderr: ' + data));
					});
					ex.on('close', function (code) {
						var m = regex.exec(line)||"";
						if (m !== '') {
							if (m[1]) { res = Number(m[1]); }
							if (m[2]) { res = Number(m[2]); }
						}
						//node.warn('[ping] res: ' + value + ' - ' + res.toString());
						if (code === 0) {
							if (compact_format) {
								resolve(res);
							} else {
								resolve({'host': value, 'delay': res});
							}
						} else {
							if (compact_format) {
								resolve(-1000);  // Value to indicate no response to ping
							} else {
								resolve({'host': value, 'delay': -1000});  // Value to indicate no response to ping
							}
						}
						ex.kill();
					});
					ex.on('exit', function() {
						ex.kill();
					});
				});
			};

			// Function to process the ping value of a server 'servidor' in the index of the array 'index'
			function ProcessPing (servidor, index) {

				// Call the Promise function to ping 'servidor' host - Return a message once all hosts have been processed
				MapPing(servidor).then(
					function(result) {
						msg.payload[index] = result;
						if (msg.payload.length == host.length) {
							if (!sent) {
								sent = true;
								node.send(msg);
							}
						}
					},
					function(error) {
						node.error(error);
					}
				);
			}

			// Process input parameters - Keep payload and topic for backwards compatibility and check timeout, delta and format
			if(msg.hasOwnProperty('payload')) {
				msg._payload = msg.payload;
			}
			if(msg.hasOwnProperty('topic')) {
				msg._topic = msg.topic;
			}
			if(msg.hasOwnProperty('timeout')) {
				tout = (isNaN(msg.timeout)?5:parseInt(msg.timeout,10));
			} else {
				tout = 5;
			}
			if(msg.hasOwnProperty('delta')) {
				delta = (isNaN(msg.delta)?25:parseInt(msg.delta,10));
			} else {
				delta = 25;
			}
			if(msg.hasOwnProperty('compact')) {
				compact_format = (msg.compact?true:false);
			} else {
				compact_format = true;
			}
			msg.payload = [];
			msg.topic = host;
			msg.timeout = tout;
			msg.delta = delta;
			msg.compact = compact_format;

			// Check that host exist
			if (!host) {
				node.warn('No host is specificed. Either specify in node configuration or by passing in msg.host');
			}

			// Process the array of hosts or the standalone one
			if (Array.isArray(host)) {
				for (let i = 0; i < host.length; i++) {
					if (typeof(host[i]) != 'undefined') {
						var myPing = setTimeout(ProcessPing, delta*(i+1), host[i], i);  // Wait to its delta slot depending on the index
					}
				}
			} else {
				MapPing(host).then(
					function(result) {
						msg.payload = result;
						node.send(msg);},
					function(error) {
						node.error(error);}
				);
			}
		});
    }

    RED.nodes.registerType("ping-many",PingNode);
}
