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
    var spawn = require('child_process').spawn;
    var plat = require('os').platform();

    function PingNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        var node = this;
		
		this.on("input", function (msg) {
			var host = msg.host || node.host;
			
			function MapPing(value, index, array) {
				var ex;
				if (plat == "linux") { ex = spawn('ping', ['-n', '-w', tout,toString(), '-c', '1', value]); }
				else if (plat.match(/^win/)) { ex = spawn('ping', ['-n', '1', '-w', (1000*tout).toString(), value]); }
				else if (plat == "darwin") { ex = spawn('ping', ['-n', '-t', tout.toString(), '-c', '1', value]); }
				else { node.error("Sorry - your platform - "+plat+" - is not recognised."); }
				var res = false;
				var line = "";
				//var regex = /from.*time.(.*)ms/;
				var regex = /=.*[<|=]([0-9]*).*TTL|ttl..*=([0-9\.]*)/;
				ex.stdout.on('data', function (data) {
					line += data.toString();
				});
				ex.stderr.on('data', function (data) {
					//console.log('[ping] stderr: ' + data);
				});
				ex.on('close', function (code) {
					var m = regex.exec(line)||"";
					if (m !== '') {
						if (m[1]) { res = Number(m[1]); }
						if (m[2]) { res = Number(m[2]); }
					}
					if (code === 0) {
						return res;
					} else {
						return -1000;  // Value to indicate no response to ping
					}
				});
			}

			if(msg.hasOwnProperty('payload')) {
				msg._payload = msg.payload;
			}
			if(msg.hasOwnProperty('topic')) {
				msg._topic = msg.topic;
			}
			if(msg.hasOwnProperty('timeout')) {
				var tout = (isNaN(msg.timeout)?5:parseInt(msg.timeout,10));
			} else {
				var tout = 5;
			}
			msg.payload = {};
			msg.topic = host;

			if (!host) {
				node.warn('No host is specificed. Either specify in node configuration or by passing in msg.host');
			}
			
			if (Array.isArray(host)) {
				const delay = host.map(MapPing);
			} else {
				let delay = MapPing(host,null, null);
			}				

			msg.payload = delay;
			
			node.send(msg);

		});

    }
    RED.nodes.registerType("ping-many",PingNode);
}
