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

var hostname = "example.org";
var http_port = 80;
var https_port = 443;

module.exports = {
    apiServer:  {
        http_port: http_port,
	https_port: https_port,
	external_port: http_port,
	hostname: "api." + hostname
    },
    	servers: [
		{
			hostname:   hostname,
			http_port:  http_port,
			https_port: https_port,
			template:   "frontend.jade"
		}
	],
    vhost: true,
    logfile: {
        filename: '/var/log/3drepo.log',
	console_level: 'debug',
	file_level: 'debug'
    },
    db: {
        host: 'localhost',
        port: 27017,
        username: 'AdminUser',
        password: 'password'
    },
    external: {
        x3domjs: 'http://x3dom.org/download/dev/x3dom.js',
	ammojs: "http://www.x3dom.org/download/dev/ammo.js",
        x3domcss : 'http://x3dom.org/download/dev/x3dom.css',
        repouicss : '../public/css/ui.css',
	repobasecss: '../public/css/base.css',
	dblistbasecss: '../public/css/dblist_base.css',
	jqueryjs : 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
	jqueryuijs : 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js',
	jqueryuicss: '//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css',
	angularjs: '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.20/angular.min.js',
	angularutilsjs: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
	angularrouterjs: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.10/angular-ui-router.js',
	bootstrapcss: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
	bootstrapjs: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js',
	bootstrapdialog: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-dialog/1.34.5/js/bootstrap-dialog.min.js',
	fancytreecss: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.fancytree/2.9.0/skin-win7/ui.fancytree.min.css',
	jqueryfancytree: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.fancytree/2.9.0/jquery.fancytree-all.min.js',
	uibootstrap: 'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.0/ui-bootstrap.min.js',
	showdownjs: 'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.0.2/showdown.min.js',
	fontawesomecss: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css',
	showdownjs: 'https://cdn.rawgit.com/showdownjs/showdown/1.0.2/dist/showdown.min.js',
	masonryjs: 'https://cdnjs.cloudflare.com/ajax/libs/masonry/3.3.0/masonry.pkgd.min.js'
	}
}

