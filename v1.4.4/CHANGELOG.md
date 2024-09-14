
# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
 
## [1.4.4] - 2023-12-16
  
Minor changes to avoid ping to stop on error thrown by newer versions of linux on network not reachable.
 
### Added
 
### Changed
 
### Fixed

- [ping-many.js](https://github.com/mbserran/node-red-contrib-advanced-ping-multiple/ping-many/ping-many.js)
  PATCH `error` bypassing to avoid newer linux versions where `ping` throws errors when network is not reachable, thus avoiding the full scan to stop.

## [1.4.3] - 2023-12-16
  
Minor changes to improve open files and file descriptors performance. Ping sessions closed right after its use.
 
### Added
 
### Changed
  
- [ping-many.js](https://github.com/mbserran/node-red-contrib-advanced-ping-multiple/ping-many/ping-many.js)
  PATCH `timeout` and `kill()` added to every ping child process in order to close it once it finishes or in any case after `msg.timeout`.
 
### Fixed
  
## [1.4.2] - 2017-12-09
 
Fully functional version. Complete set of features added to control ping parameters and different output formats.

### Added

- [ping-many.js](https://github.com/mbserran/node-red-contrib-advanced-ping-multiple/ping-many/ping-many.js)
  MAJOR `msg.timeout` and `msg.delta` added as inputs to control ping performance. Two different type of outputs generated through `msg.compact`.
   
### Changed
 
### Fixed
 